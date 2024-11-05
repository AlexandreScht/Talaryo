import config from '@/config';
import BrevoListName from '@/config/brevoList';
import { ServerException } from '@/exceptions';
import type { endEvent, payment, recurring_period, subscribeStripe } from '@/interfaces/stripe';
import { TokenUser } from '@/interfaces/token';
import { StripeRequest } from '@/interfaces/webhook';
import MemoryServerCache from '@/libs/memoryCache';
import stripeHost from '@/middlewares/stripe';
import type { UserModel } from '@/models/pg/users';
import ApiServiceFile from '@/services/api';
import MailerServiceFile from '@/services/mailer';
import PatchLimit from '@/services/patchingLimit';
import UsersServiceFile from '@/services/users';
import { refreshSessionCookie } from '@/utils/createCookie';
import { serialize_recurring } from '@/utils/serializer';
import stripeInstance from '@/utils/stripeInstance';
import SocketManager from '@libs/socketManager';
import { logger } from '@utils/logger';
import { NextFunction, Response } from 'express';
import Stripe from 'stripe';
import Container, { Service } from 'typedi';
import { v7 as uuid } from 'uuid';
/**
 * * Create items in product with metadata sub_id: {{roleUser}}
 * * Configure stripe billing client to accept switching between allowed items
 * * Configure stripe billing client to use prorate in switching subscribe offer
 * * Active stripe radar service: 0.02€ by payments
 * * Configure 3D secure with stripe radar service =>
 ** - Block the payment if the risk level >= 75 (default)
 ** - Activate 3D secure conditions if card recommend
 ** - Activate 3D secure conditions if card can do it
 */
@Service()
export default class StripeWebhook {
  private ApiService: ApiServiceFile;
  private UserServices: UsersServiceFile;
  private MailerService: MailerServiceFile;
  private SocketIo: SocketManager;
  private stripe: Stripe;
  private MemoryServer: MemoryServerCache;

  constructor() {
    this.ApiService = Container.get(ApiServiceFile);
    this.SocketIo = SocketManager.getInstance();
    this.UserServices = Container.get(UsersServiceFile);
    this.MailerService = Container.get(MailerServiceFile);
    this.stripe = stripeInstance();
    this.MemoryServer = MemoryServerCache.getInstance();
  }

  private get_payment_props(payment: Stripe.Charge.PaymentMethodDetails): payment {
    if (payment.type === 'card') {
      return {
        payment_method: 'card',
        exp_month: payment.card.exp_month,
        exp_year: payment.card.exp_year,
        card_number: payment.card.last4,
        brand: payment.card.brand,
      };
    }
  }

  private async sub_store(
    cus: string | Stripe.Customer | Stripe.DeletedCustomer,
    value?: Partial<subscribeStripe>,
  ): Promise<subscribeStripe | undefined> {
    try {
      const userSubscribeData = this.MemoryServer.getMemory<subscribeStripe>(`stripeWH.${cus}`);
      await this.MemoryServer.setMemory(`stripeWH.${cus}`, { ...userSubscribeData, ...value });
      return { ...userSubscribeData, ...value };
    } catch (error) {
      console.log(error);
    }
  }

  private isProdApp(req: StripeRequest): boolean {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/api` === 'appapi.talaryo.com';
  }

  private async getCustomerValues(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<subscribeStripe> {
    const userValues = this.MemoryServer.getMemory<subscribeStripe>(`stripeWH.${customer}`);
    if (userValues) return userValues;
    await this.sub_store(customer, { correct: true });
    return { correct: true };
  }

  private async stripeEnd(customer: string | Stripe.Customer | Stripe.DeletedCustomer, event: endEvent) {
    try {
      const userValues = this.MemoryServer.getMemory<subscribeStripe>(`stripeWH.${customer}`) || { correct: false };

      this.MemoryServer.delMemory(`stripeWH.${customer}`);
      if (!userValues.correct) {
        return;
      }

      switch (event) {
        case 'create':
          await this.CreateSubscribe(customer, userValues);
          break;
        case 'cancel':
          await this.CancelSubscribe(customer, userValues);
          break;
        case 'update':
          await this.UpdateSubscribe(customer, userValues);
          break;
        case 'auto':
          await this.CycleSubscribe(customer, userValues);
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }

    //* check event and execute the correct code
  }

  public Event = async (req: StripeRequest, res: Response, next: NextFunction) => {
    try {
      return stripeHost(async (req: StripeRequest, res: Response, next: NextFunction) => {
        try {
          const { event } = req;

          // // TODO paypal action \/\/\/
          // if (event.type === 'mandate.updated') {
          //   logger.info(`mandate.updated =>`);
          //   const mandate: Stripe.Mandate = event.data.object;
          //   console.log(mandate);
          // }
          // // TODO paypal action /\/\/\
          // if (event.type === 'customer.source.expiring') {
          //   const source: Stripe.Card = event.data.object as Stripe.Card;
          //   const mainInfos: stripeCard = {
          //     exp_month: source.exp_month,
          //     exp_year: source.exp_year,
          //     card_number: source.last4,
          //     // visa / mastercard etc
          //     brand: source.brand,
          //   };
          //   // const { customer } = source;
          //   // const MailerService = Container.get(MailerServiceFile);
          //   // MailerService.Card_expiration({
          //   //   email: userUpdate.email,
          //   //   plan: userUpdate.role,
          //   //   invoice_amount: session.items.data[0].price.unit_amount?.toString(),
          //   //   invoice_date: new Date(session.ended_at * 1000),
          //   //   user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
          //   // });
          // }

          if (event.type === 'charge.failed') {
            logger.info(`${event.type} =>`);
            try {
              const charge: Stripe.Charge = event.data.object;
              const { session, subscribe, invoice } = await this.getCustomerValues(charge.customer);
              if (charge.payment_method_details.type === 'card') {
                await this.sub_store(charge.customer, {
                  payment: this.get_payment_props(charge.payment_method_details),
                });

                if (session && subscribe && invoice) {
                  await this.stripeEnd(charge.customer, 'create');
                }
              }
            } catch (error) {
              logger.error(`EventError.${event.type} => `, error);
              throw error;
            }
            // if (charge.payment_method_details.type === 'paypal') {
            //   const mainInfos = {
            //     payer_email: charge.payment_method_details.paypal?.payer_email,
            //     payer_name: charge.payment_method_details.paypal?.payer_name,
            //     dangerous:
            //       charge.payment_method_details.paypal?.seller_protection.dispute_categories.includes('fraudulent') ||
            //       charge.payment_method_details.paypal?.seller_protection.status === 'not_eligible',
            //     transaction_id: charge.payment_method_details.paypal?.transaction_id,
            //   };
            // }
          }
          // >>>>>>>>>> invoice.payment_failed
          if (event.type === 'invoice.payment_failed') {
            logger.info(`invoice.payment_failed =>`);
            try {
              const Invoice: Stripe.Invoice = event.data.object;
              //? cancel useless event created by 3D Secure
              if (!Invoice.webhooks_delivered_at) {
                return;
              }
              const { customer, billing_reason, attempt_count, charge, created, subscription, hosted_invoice_url } = Invoice;

              if (billing_reason === 'subscription_cycle' && [1, 3, 5, 7, 8].includes(attempt_count)) {
                logger.warn(`payement recurrant echouer => ${customer}`);
                const { payment_method_details } = charge ? await this.stripe.charges.retrieve(charge?.toString()) : {};

                const startPurchase = new Date(created * 1000);
                const purchase_end = new Date(startPurchase);
                purchase_end.setDate(startPurchase.getDate() + 14);
                // send mail to user
                const { email, role, firstName } = (await this.UserServices.updateUsers(
                  { stripeCustomer: customer },
                  { subscribe_status: 'waiting' },
                  ['email', 'role', 'firstName'],
                )) as UserModel;
                if (!email) {
                  this.stripe.subscriptions.cancel(subscription as string);
                  return;
                }

                this.MailerService.Failed_subscription({
                  email: email,
                  name_plan: role?.toLocaleUpperCase() as role,
                  payment_data: charge ? this.get_payment_props(payment_method_details) : null,
                  invoice_link: hosted_invoice_url,
                  purchase_end: purchase_end.toLocaleDateString('fr-FR').toString(),
                  user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
                });

                this.MemoryServer.delMemory(`stripeWH.${customer}`);
              }
            } catch (error) {
              logger.error('EventError.invoice.payment_failed => ', error);
              throw error;
            }
          }

          // // >>>>>>>>>> payment_intent.canceled
          // if (event.type === 'payment_intent.canceled') {
          //   logger.info(`payment_intent.canceled =>`);
          //   try {
          //     const { customer, status } = event.data.object;
          //   } catch (error) {
          //     logger.error('EventError.invoice.payment_failed => ', error);
          //     throw error;
          //   }
          // }

          // >>>>>>>>>> checkout.subscription.deleted
          if (event.type === 'customer.subscription.deleted') {
            logger.info(`customer.subscription.deleted =>`);
            try {
              const {
                customer,
                created,
                plan: {
                  metadata: { sub_id: role },
                  amount,
                },
              } = event.data.object as Stripe.Subscription & { plan: Stripe.Plan };

              const userUpdate = (await this.UserServices.updateUsers(
                { stripeCustomer: customer },
                { role: 'free', subscribe_status: 'disable', subscribe_end: new Date(new Date().toISOString()) },
                ['id', 'email', 'firstName'],
              )) as UserModel;

              if (!userUpdate) throw new ServerException(500, 'invalid customerId');

              this.MailerService.Delete_subscription({
                email: userUpdate.email,
                plan: role.toLocaleUpperCase() as role,
                invoice_amount: `${(amount / 100).toFixed(2).replace('.', ',')}€`,
                cancel_date: new Date(created * 1000).toLocaleDateString('fr-FR'),
                user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
              });

              if (this.isProdApp) {
                await this.ApiService.UpdateBrevoUser({
                  email: userUpdate.email,
                  tags: [BrevoListName.free],
                  removeTags: [BrevoListName.business, BrevoListName.pro, BrevoListName.cancel, BrevoListName.during],
                });
              }
              const refreshCookie = refreshSessionCookie<TokenUser>(
                { sessionId: userUpdate.id, sessionRole: 'free', refreshToken: uuid(), cookieName: config.COOKIE_NAME },
                '31d',
              );
              this.SocketIo.ioSendTo(userUpdate.id, {
                eventName: 'delete_subscribe',
                body: { refreshCookie, role: 'free' },
                text: 'Votre abonnement a pris fin',
                date: new Date().toLocaleDateString('fr-FR').toString(),
              });
              this.MemoryServer.delMemory(`stripeWH.${customer}`);
            } catch (error) {
              logger.error('EventError.subscription.deleted => ', error);
              throw error;
            }
          }

          // >>>>>>>>>> checkout.subscription.updated
          if (event.type === 'customer.subscription.updated') {
            logger.info(`customer.subscription.updated  =>`);
            try {
              const { object: session, previous_attributes } = event.data;
              const {
                customer,
                cancel_at_period_end,
                current_period_start,
                current_period_end,
                cancellation_details,
                status: subStatus,
                plan: {
                  amount,
                  nickname: currentPeriod,
                  metadata: { sub_id: currentRole },
                },
              } = session as Stripe.Subscription & { plan: Stripe.Plan };

              const {
                plan: oldPlan,
                status,
                cancel_at_period_end: previous_canceled,
              } = (previous_attributes as Partial<Stripe.Subscription> & { plan: Stripe.Plan }) || {};
              const { invoice, subscribe, correct } = await this.getCustomerValues(customer);

              if (subStatus === 'active') {
                await this.sub_store(customer, {
                  subscribe: {
                    role: currentRole as role,
                    period: serialize_recurring(currentPeriod as recurring_period),
                    end_at: new Date(current_period_end * 1000).toString(),
                    start_at: new Date(current_period_start * 1000).toString(),
                    amount: `${(amount / 100).toFixed(2).replace('.', ',')}€`,
                  },
                  ...(!cancel_at_period_end && status !== 'incomplete' && cancellation_details?.reason !== 'cancellation_requested' && oldPlan
                    ? {
                        previous: {
                          role: oldPlan.metadata.sub_id as role,
                          amount: `${(oldPlan.amount / 100).toFixed(2).replace('.', ',')}€`,
                          isComeBack: previous_canceled || false,
                        },
                      }
                    : {}),
                  correct: !['payment_failed', 'payment_disputed'].includes(cancellation_details?.reason) && correct === true,
                });

                if (cancel_at_period_end && cancellation_details?.reason === 'cancellation_requested') {
                  await this.stripeEnd(customer, 'cancel');
                  logger.warn('cancellation_details', cancellation_details);
                } else if (invoice && invoice?.auto === true) {
                  await this.stripeEnd(customer, 'auto');
                } else if (invoice && (!status || status !== 'incomplete')) {
                  await this.stripeEnd(customer, 'update');
                } else if (subscribe && invoice) {
                  await this.stripeEnd(customer, 'create');
                }
              } else {
                this.MemoryServer.delMemory(`stripeWH.${customer}`);
              }
            } catch (error) {
              logger.error('EventError.subscription.updated => ', error);
              throw error;
            }
          }

          // >>>>>>>>>> checkout.payment_succeeded
          if (event.type === 'invoice.payment_succeeded') {
            logger.info(`invoice.payment_succeeded =>`);
            try {
              const Invoice: Stripe.Invoice = event.data.object;
              const { customer, billing_reason, hosted_invoice_url: invoice_link, id: invoiceId, status } = Invoice;

              const { session, subscribe, correct, previous } = await this.getCustomerValues(customer);

              await this.sub_store(customer, {
                invoice: {
                  invoiceId,
                  invoice_link,
                  auto: billing_reason === 'subscription_cycle',
                },
                correct: status === 'paid' && correct === true,
              });

              if (session && subscribe && billing_reason === 'subscription_create') {
                await this.stripeEnd(customer, 'create');
              }
              if (subscribe && billing_reason === 'subscription_cycle') {
                await this.stripeEnd(customer, 'auto');
              }
              if (subscribe && previous && billing_reason === 'subscription_update') {
                await this.stripeEnd(customer, 'update');
              }
            } catch (error) {
              logger.error('EventError.invoice.payment_succeeded => ', error);
              throw error;
            }
          }

          // >>>>>>>>>> checkout.session.completed
          if (event.type === 'checkout.session.completed') {
            logger.info(`checkout.session.completed =>`);
            try {
              const session: Stripe.Checkout.Session = event.data.object;
              const { customer, client_reference_id, payment_status, status } = session;
              const { invoice, subscribe, correct } = await this.getCustomerValues(customer);

              await this.sub_store(customer, {
                session: { userId: Number.parseInt(client_reference_id, 10) },
                correct: (status === 'complete' || payment_status === 'paid') && correct === true,
              });

              if (invoice && subscribe) {
                await this.stripeEnd(customer, 'create');
              }
            } catch (error) {
              logger.error('EventError.session.completed => ', error);
              throw error;
            }
          }
          res.json({ received: true });
        } catch (error) {
          logger.error('StripeWebhook.Event => ', error);
          next(error);
        }
      }, this.stripe)(req, res, next);
    } catch (error) {
      console.log(error);
    }
  };

  private async CycleSubscribe(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer,
    stripeStore: Pick<subscribeStripe, 'subscribe' | 'invoice'>,
  ) {
    const { email, firstName, id } = (await this.UserServices.updateUsers(
      { stripeCustomer: customer },
      {
        role: stripeStore.subscribe.role,
        subscribe_end: new Date(stripeStore.subscribe.end_at),
        subscribe_status: 'active',
      },
      ['email', 'firstName', 'id'],
    )) as UserModel;

    this.MailerService.Invoice({
      email,
      invoice_link: stripeStore.invoice.invoice_link,
      invoice_amount: stripeStore.subscribe.amount,
      invoice_date: new Date(stripeStore.subscribe.start_at).toLocaleDateString('fr-FR'),
      user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
    });
    this.SocketIo.ioSendTo(id, {
      eventName: 'subscription_cycle',
      text: "Votre facture de renouvellement d'abonnement vous a été envoyée par mail",
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  }

  private async UpdateSubscribe(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer,
    stripeStore: Pick<subscribeStripe, 'subscribe' | 'invoice' | 'previous'>,
  ) {
    const userUpdate = (await this.UserServices.updateUsers(
      { stripeCustomer: customer },
      {
        role: stripeStore.subscribe.role,
        subscribe_end: new Date(stripeStore.subscribe.end_at),
        subscribe_status: 'active',
      },
      ['email', 'firstName', 'id', 'role'],
    )) as UserModel;

    if (!userUpdate) throw new ServerException(500, 'invalid customerId');

    new PatchLimit(userUpdate);

    this.MailerService.Update_subscription({
      email: userUpdate.email,
      old_name_plan: stripeStore.previous.role.toLocaleUpperCase(),
      old_price_plan: stripeStore.previous.amount,
      new_name_plan: stripeStore.subscribe.role.toLocaleUpperCase(),
      new_price_plan: stripeStore.subscribe.amount,
      new_period_plan: stripeStore.subscribe.period,
      next_invoice_date: new Date(stripeStore.subscribe.end_at).toLocaleDateString('fr-FR'),
      invoice_link: stripeStore.invoice.invoice_link,
      user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
    });
    if (this.isProdApp) {
      await this.ApiService.UpdateBrevoUser({
        email: userUpdate.email,
        tags: [BrevoListName[userUpdate.role], BrevoListName.during],
        removeTags: [BrevoListName.business, BrevoListName.free, BrevoListName.pro, BrevoListName.cancel],
      });
    }

    const refreshCookie = refreshSessionCookie<TokenUser>(
      { sessionId: userUpdate.id, sessionRole: userUpdate.role, refreshToken: uuid(), cookieName: config.COOKIE_NAME },
      '31d',
    );
    this.SocketIo.ioSendTo(userUpdate.id, {
      eventName: 'payment_success',
      body: { refreshCookie, role: userUpdate.role },
      text: `Vous avez changer d'abonnement, afin de passer au plan ${userUpdate.role.toLocaleUpperCase()}`,
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  }

  private async CancelSubscribe(customer: string | Stripe.Customer | Stripe.DeletedCustomer, stripeStore: Pick<subscribeStripe, 'subscribe'>) {
    try {
      const { email, firstName, id } = (await this.UserServices.updateUsers(
        { stripeCustomer: customer },
        {
          subscribe_status: 'pending',
        },
        ['id', 'email', 'firstName'],
      )) as UserModel;
      if (!email) throw new ServerException(500, 'invalid customerId');

      const endData = new Date(stripeStore.subscribe.end_at).toLocaleDateString('fr-FR');
      this.MailerService.Cancel_request({
        email,
        plan: stripeStore.subscribe.role.toLocaleUpperCase() as role,
        invoice_amount: stripeStore.subscribe.amount,
        cancel_date: endData,
        user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
      });
      if (this.isProdApp) {
        await this.ApiService.UpdateBrevoUser({ email, tags: [BrevoListName.cancel], removeTags: [BrevoListName.during] });
      }
      this.SocketIo.ioSendTo(id, {
        eventName: 'cancel_subscribe',
        text: `Vous avez annulé votre abonnement, celui-ci prendra fin le ${endData}`,
        date: new Date().toLocaleDateString('fr-FR').toString(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  private async CreateSubscribe(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer,
    stripeStore: Pick<subscribeStripe, 'subscribe' | 'invoice' | 'session'>,
  ) {
    try {
      const userUpdate = (await this.UserServices.updateUsers(
        { id: stripeStore.session.userId },
        {
          stripeCustomer: customer,
          subscribe_start: new Date(stripeStore.subscribe.start_at),
          subscribe_end: new Date(stripeStore.subscribe.end_at),
          role: stripeStore.subscribe.role,
          subscribe_status: 'active',
        },
        ['email', 'firstName', 'id', 'role'],
      )) as UserModel;
      if (!userUpdate) throw new ServerException(500, 'invalid userId');
      new PatchLimit(userUpdate);
      this.MailerService.New_invoice({
        email: userUpdate.email,
        invoice_link: stripeStore.invoice.invoice_link,
        invoice_amount: stripeStore.subscribe.amount,
        invoice_next_date: new Date(stripeStore.subscribe.end_at).toLocaleDateString('fr-FR'),
        period_plan: stripeStore.subscribe.period,
        name_plan: stripeStore.subscribe.role.toLocaleUpperCase(),
        user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
      });
      if (this.isProdApp) {
        await this.ApiService.UpdateBrevoUser({
          email: userUpdate.email,
          tags: [BrevoListName[stripeStore.subscribe.role], BrevoListName.during],
          removeTags: [BrevoListName.business, BrevoListName.free, BrevoListName.pro, BrevoListName.cancel],
        });
      }

      const refreshCookie = refreshSessionCookie<TokenUser>(
        { sessionId: userUpdate.id, sessionRole: userUpdate.role, refreshToken: uuid(), cookieName: config.COOKIE_NAME },
        '31d',
      );

      this.SocketIo.ioSendTo(userUpdate.id, {
        eventName: 'payment_success',
        body: { refreshCookie, role: userUpdate.role },
        text: `Vous avez souscris au plan d'abonnement ${userUpdate.role.toLocaleUpperCase()}`,
        date: new Date().toLocaleDateString('fr-FR').toString(),
      });
    } catch (error) {
      console.log(error);
    }
  }
}
