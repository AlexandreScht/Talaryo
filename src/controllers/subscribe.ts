import config from '@/config';
import { InvalidSessionError } from '@/exceptions';
import stripe from '@/libs/stipeInstance';
import { cancelOptionSubValidator, stringValidator } from '@/libs/validate';
import auth from '@/middlewares/auth';
import validator from '@/middlewares/validator';
import serialize_recurring from '@/utils/serialize_recurring';
import mw from '@middlewares/mw';
import UsersServiceFile from '@services/users';
import type Stripe from 'stripe';
import { Container } from 'typedi';

const SubscriptionController = ({ app }) => {
  const UserServices = Container.get(UsersServiceFile);
  app.post(
    '/cancel-subscription',
    mw([
      auth(),
      validator({
        body: {
          subId: stringValidator.required(),
          option: cancelOptionSubValidator,
        },
      }),
      async ({
        locals: {
          body: { options, subId },
        },
        res,
        next,
      }) => {
        try {
          await stripe.subscriptions.update(subId, {
            cancel_at_period_end: true,
            ...(options && {
              cancellation_details: {
                ...(options.feedback && { feedback: options.feedback }),
                ...(options.feedback === 'other' && options.comment && { comment: options.comment }),
              },
            }),
          });
          res.send({ res: true });
        } catch (error) {
          console.log(error);

          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-subscription',
    mw([
      auth(),
      async ({ session: { sessionId }, res, next }) => {
        try {
          const [found, { stripeCustomer, subscribe_status }] = await UserServices.findUserById(sessionId);

          if (!found) {
            throw new InvalidSessionError();
          }
          if (!stripeCustomer) {
            res.send({ sub: undefined });
            return;
          }
          const { data } = await stripe.subscriptions.list({
            customer: stripeCustomer as string,
            status: 'active',
            limit: 1,
          });
          if (!data.length) {
            res.send({ sub: undefined });
            return;
          }

          const [
            {
              id: subId,
              current_period_end: ended_at,
              items: {
                data: [
                  {
                    price: { id: priceId },
                    id: itemSub,
                  },
                ],
              },
            },
          ] = data;

          res.send({
            sub: {
              subId,
              priceId,
              itemSub,
              subscribe_status,
              ended_at: new Date(ended_at * 1000).toLocaleDateString('fr-FR'),
            },
          });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/update-subscription',
    mw([
      auth(),
      validator({
        query: {
          price_id: stringValidator.required(),
          itemSub: stringValidator.required(),
          subId: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          query: { price_id, itemSub, subId },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const [found, { stripeCustomer }] = await UserServices.findUserById(sessionId);

          if (!found) {
            throw new InvalidSessionError();
          }
          const { url } = await stripe.billingPortal.sessions.create({
            customer: stripeCustomer as string,
            return_url: `${config.ORIGIN}/billing`,
            flow_data: {
              subscription_update_confirm: {
                items: [
                  {
                    quantity: 1,
                    price: price_id,
                    id: itemSub,
                  },
                ],
                subscription: subId,
              },
              type: 'subscription_update_confirm',
            },
          });
          res.send({ res: url });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/create-subscription/:price_id',
    mw([
      auth(),
      validator({
        params: {
          price_id: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          params: { price_id },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const [found, { stripeCustomer }] = await UserServices.findUserById(sessionId);

          if (!found) {
            throw new InvalidSessionError();
          }
          const {
            metadata: { sub_id },
          } = await stripe.prices.retrieve(price_id);
          const { url } = await stripe.checkout.sessions.create({
            ...(stripeCustomer
              ? {
                  customer: stripeCustomer as string,
                }
              : { client_reference_id: sessionId }),

            payment_method_types: ['card', 'link'],
            line_items: [
              {
                price: price_id,
                quantity: 1,
              },
            ],
            // 30 min
            expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
            allow_promotion_codes: true,
            mode: 'subscription',
            success_url: `${config.ORIGIN}/payment/successful?plan=${sub_id.toLocaleUpperCase()}`,
            cancel_url: `${config.ORIGIN}/billing`,
          });
          res.send({ res: url });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-Invoices',
    mw([
      auth(),
      async ({ session: { sessionId }, res, next }) => {
        try {
          const [found, { stripeCustomer }] = await UserServices.findUserById(sessionId);

          if (!found) {
            throw new InvalidSessionError();
          }
          const { data } = await stripe.invoices.list({
            customer: stripeCustomer as string,
          });

          const billing_reason = {
            subscription_cycle: 'Renouvellement',
            subscription_create: 'Souscription',
            subscription_update: 'Changement',
          };

          const recupCurrentPlan = (data: Stripe.InvoiceLineItem[]) => {
            if (data.length > 1) {
              const [{}, { price, period }] = data;
              return {
                plan: price.metadata?.sub_id.toLocaleUpperCase(),
                start: new Date(period.end * 1000).toLocaleDateString('fr-FR'),
                recurring: serialize_recurring(price.recurring, false),
              };
            }
            const [{ price, period }] = data;
            return {
              plan: price.metadata?.sub_id.toLocaleUpperCase(),
              start: new Date(period.start * 1000).toLocaleDateString('fr-FR'),
              recurring: serialize_recurring(price.recurring, false),
            };
          };

          const invoices = (data || []).map(i => ({
            price: i.amount_due / 100,
            billing: billing_reason[i.billing_reason],
            pdf: i.invoice_pdf,
            url: i.hosted_invoice_url,
            paid: i.status === 'paid',
            ...recupCurrentPlan(i.lines.data),
          }));

          res.send({ res: invoices });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default SubscriptionController;
