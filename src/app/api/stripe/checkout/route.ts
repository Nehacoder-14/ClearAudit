import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { stripe, PRICING_PLANS } from '@/lib/stripe/client';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 503 });
    }

    const { planId } = await req.json();
    const plan = PRICING_PLANS.find((p) => p.id === planId);

    if (!plan || plan.id === 'free') {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    if (plan.id === 'enterprise') {
      return NextResponse.json({
        success: true,
        redirect: 'mailto:sales@clearaudit.app?subject=Enterprise%20Inquiry',
      });
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ success: false, error: 'Price not configured' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    let customerId = user?.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        name: user?.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          tier: 'FREE',
          status: 'ACTIVE',
        },
        update: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=canceled`,
      metadata: { userId: session.user.id, tier: plan.tier },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
