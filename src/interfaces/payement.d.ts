import type Stripe from 'stripe';
import { Url } from 'url';
import { role } from './users';

export type billPeriod = 'monthly' | 'trimestrial' | 'annual';

export type plan = 'Free' | 'Pro' | 'Business';

export type functionalityList = {
  title: string;
  tooltip: undefined | string;
}[];

export interface billingPlan {
  name: plan;
  role: role;
  description: string;
  prices: {
    monthly: undefined | string;
    trimestrial: undefined | string;
    annual: undefined | string;
  };
  list: functionalityList;
}

export type cancelFeedback =
  Stripe.Emptyable<Stripe.SubscriptionCancelParams.CancellationDetails.Feedback>;

export interface cancelProps {
  label: string;
  value: cancelFeedback;
}

export interface cancelStripeOptions {
  feedback?: cancelFeedback;
  comment?: string;
}

interface priceProps {
  priceId?: string;
  price?: number;
  recurring?: number;
}
interface priceData {
  price: number;
  plan: string;
  recurring: Stripe.Price.Recurring;
}

export type fetchSub =
  | {
      subId: string;
      priceId: string;
      itemSub: string;
      ended_at: string;
      subscribe_status: 'active' | 'waiting' | 'pending' | 'disable';
    }
  | undefined;

interface Invoices {
  price: string;
  billing: string;
  pdf: string;
  url: Url;
  paid: boolean;
  start: string;
  plan: string;
  recurring: string;
}
