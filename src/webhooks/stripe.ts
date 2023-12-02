import config from '@config';
import type { RequestWithWebhook } from '@interfaces/request';
import stripeHost from '@middlewares/stripe';
import { logger } from '@utils/logger';
import Stripe from 'stripe';

const { stripeENV } = config;

const stripe = new Stripe(stripeENV.KEY, {
  apiVersion: '2023-08-16',
});

const StripeWebhook = ({ app }) => {
  app.post(
    '/webhook',
    stripeHost(async (req: RequestWithWebhook, res, next) => {
      try {
        const { event } = req;
        switch (event.type) {
          case 'payment_intent.succeeded':
            const stripeObject: Stripe.PaymentIntent = event.data.object as Stripe.PaymentIntent;
            logger.info(`💰 PaymentIntent status: ${stripeObject.status}`);
            break;
          default:
            logger.info(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
      } catch (error) {
        logger.error(error);
        next(error);
      }
    }, stripe),
  );
};

export default StripeWebhook;
