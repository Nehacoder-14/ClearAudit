import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier || 'PRO';

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { tier: tier as 'PRO' | 'ENTERPRISE' },
          });

          await prisma.subscription.update({
            where: { userId },
            data: {
              tier: tier as 'PRO' | 'ENTERPRISE',
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
            },
          });

          await prisma.auditLog.create({
            data: {
              userId,
              action: 'SUBSCRIPTION_CREATED',
              entity: 'subscription',
              metadata: { tier, sessionId: session.id },
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const dbSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (dbSub) {
          const statusMap: Record<string, 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING'> = {
            active: 'ACTIVE',
            canceled: 'CANCELED',
            past_due: 'PAST_DUE',
            trialing: 'TRIALING',
          };

          const subData = sub as unknown as Record<string, unknown>;
          const periodStart = subData.current_period_start as number | null;
          const periodEnd = subData.current_period_end as number | null;

          await prisma.subscription.update({
            where: { id: dbSub.id },
            data: {
              status: statusMap[sub.status] ?? 'ACTIVE',
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
              ...(periodStart ? { currentPeriodStart: new Date(periodStart * 1000) } : {}),
              ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const dbSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (dbSub) {
          await prisma.user.update({
            where: { id: dbSub.userId },
            data: { tier: 'FREE' },
          });

          await prisma.subscription.update({
            where: { id: dbSub.id },
            data: { tier: 'FREE', status: 'CANCELED' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
