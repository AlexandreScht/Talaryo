import type { TokenUser } from '@/interfaces/auth';
import type { NextFunction, Request, Response } from 'express';
import type Stripe from 'stripe';
import * as yup from 'yup';

export type mwHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export type handler = (req: Request, res: Response, next: NextFunction) => Promise<void | NodeJS.Timeout>;

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
