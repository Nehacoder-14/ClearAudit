import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' })
  : null;

export const TIER_LIMITS = {
  FREE: { contracts: 5, features: ['basic_search', 'basic_alerts'] },
  PRO: { contracts: Infinity, features: ['semantic_search', 'ai_chat', 'alerts', 'export'] },
  ENTERPRISE: { contracts: Infinity, features: ['all', 'sso', 'api_access', 'priority_support'] },
} as const;

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for freelancers getting started',
    features: [
      'Up to 5 contracts',
      'Basic AI extraction',
      'Email alerts',
      'Semantic search',
    ],
    tier: 'FREE' as const,
    stripePriceId: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    description: 'For growing teams managing contracts at scale',
    features: [
      'Unlimited contracts',
      'Claude AI assistant',
      'Advanced alerts & scheduling',
      'Vector semantic search',
      'Priority processing',
      'Audit logs',
    ],
    tier: 'PRO' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    interval: 'custom',
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    tier: 'ENTERPRISE' as const,
    stripePriceId: null,
  },
];

export function canAddContract(tier: string, currentCount: number): boolean {
  const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] ?? TIER_LIMITS.FREE;
  return currentCount < limits.contracts;
}
