import * as stripeInstance from '@/utils/stripeInstance';
import type Stripe from 'stripe';

const stripeMock = {
  subscriptions: {
    update: jest.fn(),
    list: jest.fn(),
    cancel: jest.fn(),
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
} as jest.MockedObjectDeep<Stripe>;

jest.spyOn(stripeInstance, 'default').mockReturnValue(stripeMock);

export default stripeMock;
