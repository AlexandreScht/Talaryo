import config from '@config';
import type { RequestWithWebhook, handler } from '@interfaces/request';
import { logger } from '@utils/logger';
import type { NextFunction, Response } from 'express';
import type Stripe from 'stripe';

const { stripeENV } = config;

//? check signature of stripe token
const stripeHost =
  (handle: handler, stripe: Stripe) =>
  async (req: RequestWithWebhook, res: Response, next: NextFunction): Promise<void> => {
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
