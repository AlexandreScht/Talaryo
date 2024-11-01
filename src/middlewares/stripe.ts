import { stripeHandler } from '@/interfaces/stripe';
import type { StripeRequest } from '@/interfaces/webhook';
import config from '@config';
import { logger } from '@utils/logger';
import type { NextFunction, Response } from 'express';
import type Stripe from 'stripe';

const { stripeENV } = config;

//? check signature of stripe token
const stripeHost =
  (handle: stripeHandler, stripe: Stripe) =>
  async (req: StripeRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sig = req.headers['stripe-signature'];

      const event: Stripe.Event = stripe.webhooks.constructEvent(req.body, sig, stripeENV.WEBHOOK);
      req.event = event;

      await handle(req, res, next);
    } catch (err) {
      logger.error(err.message);
      next(err);
    }
  };

export default stripeHost;
