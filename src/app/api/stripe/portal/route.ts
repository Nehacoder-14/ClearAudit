import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 503 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ success: false, error: 'No billing account found' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Portal failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
