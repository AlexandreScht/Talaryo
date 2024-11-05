import type { NextFunction, Request, Response } from 'express';
import type Stripe from 'stripe';

interface paypal_payment {
  payment_method: 'paypal';
  payer_email: string;
  payer_name: string;
  transaction_id: string;
}

interface card_payment {
  payment_method: 'card';
  exp_month: number;
  exp_year: number;
  card_number: string;
  brand: string;
}

type payment = card_payment | paypal_payment;

interface session {
  userId: number;
}

type recurring_period = 'Annuel' | 'Mensuel' | 'Trimestriel';
interface subscribe {
  role: role;
  period: string;
  end_at: string;
  start_at: string;
  amount: string;
}

interface previous {
  role: role;
  isComeBack: boolean;
  amount: string;
}

interface invoice {
  invoice_link: string;
  invoiceId: string;
  auto?: boolean;
}

type endEvent = 'create' | 'update' | 'cancel' | 'auto';

interface subscribeStripe {
  invoice?: invoice;
  session?: session;
  subscribe?: subscribe;
  previous?: previous;
  payment?: payment;
  correct: boolean;
}
export type stripeStore = Map<string | Stripe.Customer | Stripe.DeletedCustomer, subscribeStripe>;
interface stripeEnd extends subscribeStripe {
  customer: string;
}
export type stripeHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | NodeJS.Timeout>;

type Feedback = 'customer_service' | 'too_expensive' | 'missing_features' | 'unused' | 'other';
