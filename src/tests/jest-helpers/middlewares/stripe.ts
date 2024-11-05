import { InvalidCredentialsError } from '@/exceptions';
import { StripeRequest } from '@/interfaces/webhook';
import * as stripeMiddleware from '@/middlewares/stripe';
import { NextFunction, Request, Response } from 'express';

export default function stripeHostMocked() {
  jest.spyOn(stripeMiddleware, 'default').mockImplementation(handle => async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['stripe-signature'];

    if (!key || key !== 'secret_stripe') {
      next(new InvalidCredentialsError('stripe signature incorrect'));
      return;
    }

    const stripeRequest = {
      ...req,
      event: req.body,
    } as StripeRequest;

    await handle(stripeRequest, res, next);
  });
}
