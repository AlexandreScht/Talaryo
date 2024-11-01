import * as stripeInstance from '@/utils/stripeInstance';
import type Stripe from 'stripe';

const stripeMock = {
  subscriptions: {
    update: jest.fn().mockResolvedValue('ta grand mere'),
    list: jest.fn(),
  },
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  prices: {
    retrieve: jest.fn(),
  },
  invoices: {
    list: jest.fn(),
  },
  charges: {
    retrieve: jest.fn(),
  },
} as unknown as Stripe;
export default function stripeMocked() {
  jest.spyOn(stripeInstance, 'default').mockReturnValue(stripeMock);
  return stripeMock as any;
}
