import config from '@/config';
import { InvalidArgumentError, ServerException } from '@/exceptions';
import {
  ControllerMethods,
  ExpressHandler,
  SubscribeControllerCancel,
  SubscribeControllerCreate,
  SubscribeControllerUpdate,
} from '@/interfaces/controller';
import { SkipInTest } from '@/libs/decorators';
import UserServiceFile from '@/services/users';
import { logger } from '@/utils/logger';
import { serialize_recurring } from '@/utils/serializer';
import stripeInstance from '@/utils/stripeInstance';
import type Stripe from 'stripe';
import Container from 'typedi';

export default class SubscribeControllerFile implements ControllerMethods<SubscribeControllerFile> {
  private stripe: any;
  private UserService: UserServiceFile;

  constructor() {
    this.UserService = Container.get(UserServiceFile);
    this.stripe = stripeInstance();
  }

  public cancel: ExpressHandler<SubscribeControllerCancel> = async ({
    locals: {
      body: { subId, option },
    },
    res,
    next,
  }) => {
    try {
      const a = await this.stripe.subscriptions.update(subId, {
        cancel_at_period_end: true,
        ...(option && {
          cancellation_details: {
            ...(option.feedback && { feedback: option.feedback }),
            ...(option.feedback === 'other' && option.comment && { comment: option.comment }),
          },
        }),
      });

      console.log(a);

      res.status(204).send();
    } catch (error) {
      console.log(error);

      if (!(error instanceof ServerException)) {
        logger.error('SubscribeControllerFile.cancel => ', error);
      }
      next(error);
    }
  };

  public get: ExpressHandler = async ({ res, session: { sessionId }, next }) => {
    try {
      const user = await this.UserService.getUser({ id: sessionId }, ['subscribe_status', 'stripeCustomer']);

      if (!user) {
        throw new InvalidArgumentError();
      }

      const { subscribe_status, stripeCustomer } = user;

      if (!stripeCustomer) {
        res.status(204).send();
        return;
      }

      const response = await SkipInTest(
        async () => {
          const { data } = await this.stripe.subscriptions.list({
            customer: stripeCustomer as string,
            status: 'active',
            limit: 1,
          });
          if (!data.length) {
            return { status: 204 };
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

          return {
            status: 200,
            send: {
              subId,
              priceId,
              itemSub,
              subscribe_status,
              ended_at: new Date(ended_at * 1000).toLocaleDateString('fr-FR'),
            },
          };
        },
        () => {
          if (user.subscribe_status === 'disable') {
            return { status: 204 };
          }
          return {
            status: 200,
            send: {
              subId: 'subId',
              priceId: 'priceId',
              itemSub: 'itemSub',
              subscribe_status,
              ended_at: new Date().toLocaleDateString('fr-FR'),
            },
          };
        },
      )();

      const { status, send } = response();

      res.status(status).send(send);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SubscribeControllerFile.get => ', error);
      }
      next(error);
    }
  };

  public update: ExpressHandler<SubscribeControllerUpdate> = async ({
    locals: {
      body: { price_id, itemSub, subId },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const { stripeCustomer } = (await this.UserService.getUser({ id: sessionId }, ['stripeCustomer'])) || {};

      if (!stripeCustomer) {
        throw new InvalidArgumentError();
      }

      const response = await SkipInTest(
        async () => {
          const { url } = await this.stripe.billingPortal.sessions.create({
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
          return { status: 201, send: { url } };
        },
        () => {
          return { status: 201, send: { url: 'http://test-updateSub.com' } };
        },
      )();
      const { status, send } = response();
      res.status(status).send(send);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SubscribeControllerFile.update => ', error);
      }
      next(error);
    }
  };

  public create: ExpressHandler<SubscribeControllerCreate> = async ({
    locals: {
      body: { price_id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const { stripeCustomer } = (await this.UserService.getUser({ id: sessionId }, ['stripeCustomer'])) || {};

      if (!stripeCustomer) {
        throw new InvalidArgumentError();
      }

      const response = await SkipInTest(
        async () => {
          const {
            metadata: { sub_id },
          } = await this.stripe.prices.retrieve(price_id);
          const { url } = await this.stripe.checkout.sessions.create({
            ...(stripeCustomer
              ? {
                  customer: stripeCustomer as string,
                }
              : { client_reference_id: String(sessionId) }),

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
          return { status: 201, send: { url } };
        },
        () => {
          return { status: 201, send: { url: 'http://test-createSub.co' } };
        },
      )();

      const { status, send } = response();
      res.status(status).send(send);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SubscribeControllerFile.create => ', error);
      }
      next(error);
    }
  };

  public invoices: ExpressHandler = async ({ res, session: { sessionId }, next }) => {
    try {
      const { stripeCustomer } = (await this.UserService.getUser({ id: sessionId }, ['stripeCustomer'])) || {};

      if (!stripeCustomer) {
        throw new InvalidArgumentError();
      }

      const response = await SkipInTest(
        async () => {
          const { data } = await this.stripe.invoices.list({
            customer: stripeCustomer as string,
          });

          const billing_reason = {
            subscription_cycle: 'Renouvellement',
            subscription_create: 'Souscription',
            subscription_update: 'Changement',
          };

          const getCurrentPlan = (data: Stripe.InvoiceLineItem[]) => {
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
            ...getCurrentPlan(i.lines.data),
          }));

          return { status: 200, send: { invoices } };
        },
        () => {
          return {
            status: 200,
            send: {
              invoices: [
                {
                  price: 150,
                  billing: 'Souscription',
                  pdf: 'pdf_link',
                  url: 'invoice_url',
                  paid: true,
                  plan: 'sub_id',
                  start: new Date().toLocaleDateString('fr-FR'),
                  recurring: serialize_recurring({ interval: 'month', interval_count: 3 } as any, false),
                },
              ],
            },
          };
        },
      )();

      const { status, send } = response();
      res.status(status).send(send);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SubscribeControllerFile.invoices => ', error);
      }
      next(error);
    }
  };
}
