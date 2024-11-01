import type { NextFunction, Request, Response } from 'express';
import type Stripe from 'stripe';

interface paypal_payment {
  payment_method: 'paypal';
  payer_email: string;
  payer_name: string;
  dangerous?: boolean;
  transaction_id: string;
}

interface card_payment {
  payment_method: 'card';
  exp_month: number;
  exp_year: number;
  card_number: string;
  brand: string;
  dangerous?: boolean;
}

type payment = card_payment | paypal_payment;

interface subscribeStripe {
  sub_end?: Date;
  role?: role;
  period_plan?: Stripe.Price.Recurring;
  payment?: payment;
  invoice_link?: string;
}
export type stripeStore = Map<string | Stripe.Customer | Stripe.DeletedCustomer, subscribeStripe>;
export type stripeHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | NodeJS.Timeout>;

type Feedback = 'customer_service' | 'too_expensive' | 'missing_features' | 'unused' | 'other';
