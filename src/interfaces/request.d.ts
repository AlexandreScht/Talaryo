import type { TokenUser } from '@/interfaces/auth';
import type { role } from '@interfaces/models';
import type { NextFunction, Request, Response } from 'express';
import type Stripe from 'stripe';
import * as yup from 'yup';

export type mwHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export type handler = (req: Request, res: Response, next: NextFunction) => Promise<void | NodeJS.Timeout>;

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
export type stripeHandler = (req: Request, res: Response, next: NextFunction, stripeStore: stripeStore) => Promise<void | NodeJS.Timeout>;

export type validatorsProps = Record<string, yup.Schema<any, any, any, any>>;

export interface validators {
  body?: validatorsProps;
  params?: validatorsProps;
  query?: validatorsProps;
}

export interface ctx {
  req: RequestWithAuth;
  res: Response;
  locals: Record<string, unknown>;
  session: Partial<TokenUser> | null;
  next: (err?: unknown) => Promise<void>;
}

export interface RequestWithAuth extends Request {
  session: Partial<TokenUser>;
}

export interface RequestWithWebhook extends Request {
  event?: Stripe.Event;
}

export type ApiRes = [Error] | [null, unknown];
