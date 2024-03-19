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
    '/stripe_webhook',
    stripeHost(async (req: RequestWithWebhook, res, next) => {
      try {
        const { event } = req;
        switch (event.type) {
          case 'checkout.session.completed':
            logger.info(`checkout.session.completed =>`);
            const session: Stripe.Checkout.Session = event.data.object;
            console.log(`userId: ${session.client_reference_id}`);
            console.log(`pr_status: ${session.status}`);
            console.log(`customer: ${session.customer}`);

            break;
          case 'customer.subscription.deleted':
            logger.info(`customer.subscription.deleted =>`);
            const subscriptionDeleted: Stripe.Subscription = event.data.object;
            console.log(`customer id end: ${subscriptionDeleted.customer}`);
            break;
          case 'customer.subscription.updated':
            logger.info(`customer.subscription.updated =>`);
            const subscriptionUpdate: Stripe.Subscription = event.data.object;
            console.log(`customer id update: ${subscriptionUpdate.customer}`);
            console.log(`customer subscription end: ${subscriptionUpdate.ended_at}`);
            console.log(`items: ${subscriptionUpdate.items}`);
            const items = subscriptionUpdate.items.data;
            items.forEach(item => {
              console.log(item);
              console.log(item.plan);
              const newRole: string = item.plan.metadata?.subscribeRole;
              console.log(newRole);
            });
            console.log(`metadata: ${subscriptionUpdate.metadata}`);
            break;
          // logger.info(`Unhandled event type ${event.type}`);
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
