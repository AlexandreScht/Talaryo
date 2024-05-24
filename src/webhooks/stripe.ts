import { role } from '@/interfaces/models';
import stripe from '@/libs/stipeInstance';
import { createToken, refreshCookie } from '@/libs/token';
import MailerServiceFile from '@/services/mailer';
import UsersServiceFile from '@/services/users';
import PatchLimit from '@/utils/patchingLimit';
import serialize_recurring from '@/utils/serialize_recurring';
import { StoredSocket } from '@/utils/socketManager';
import type { RequestWithWebhook, payment, subscribeStripe } from '@interfaces/request';
import stripeHost from '@middlewares/stripe';
import { logger } from '@utils/logger';
import type Stripe from 'stripe';
import Container from 'typedi';

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

const get_payment_props = (payment: Stripe.Charge.PaymentMethodDetails): payment => {
  if (payment.type === 'card') {
    return {
      payment_method: 'card',
      exp_month: payment.card.exp_month,
      exp_year: payment.card.exp_year,
      card_number: payment.card.last4,
      brand: payment.card.brand,
    };
  }
};

const StripeWebhook = ({ app }) => {
  app.post(
    '/stripe_webhook',
    stripeHost(async (req: RequestWithWebhook, res, next, sub) => {
      const sub_store = (
        cus: string | Stripe.Customer | Stripe.DeletedCustomer,
        value?: Partial<subscribeStripe>,
        del?: boolean,
      ): subscribeStripe | undefined => {
        const userSubscribeData = sub.get(cus);
        if (del) {
          sub.delete(cus);
          return { ...userSubscribeData, ...value };
        }
        if (value) {
          sub.set(cus, { ...userSubscribeData, ...value });
          return { ...userSubscribeData, ...value };
        }

        return userSubscribeData;
      };
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
          logger.info(`charge.failed =>`);
          const charge: Stripe.Charge = event.data.object;
          if (charge.payment_method_details.type === 'card') {
            sub_store(charge.customer, {
              payment: {
                payment_method: 'card',
                exp_month: charge.payment_method_details.card.exp_month,
                exp_year: charge.payment_method_details.card.exp_year,
                card_number: charge.payment_method_details.card.last4,
                brand: charge.payment_method_details.card.brand,
              },
            });
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
        if (event.type === 'charge.succeeded') {
          logger.info(`charge.succeeded =>`);
          const charge: Stripe.Charge = event.data.object;
          if (charge.payment_method_details.type === 'card') {
            sub_store(charge.customer, {
              payment: {
                payment_method: 'card',
                exp_month: charge.payment_method_details.card.exp_month,
                exp_year: charge.payment_method_details.card.exp_year,
                card_number: charge.payment_method_details.card.last4,
                brand: charge.payment_method_details.card.brand,
                dangerous: charge.outcome.risk_score >= 65,
              },
            });
          }
        }
        // >>>>>>>>>> invoice.payment_failed
        if (event.type === 'invoice.payment_failed') {
          const Invoice: Stripe.Invoice = event.data.object;
          //? cancel useless event created by 3D Secure
          if (!Invoice.webhooks_delivered_at) {
            return;
          }
          const { customer, billing_reason, attempt_count, charge, created, subscription, hosted_invoice_url } = Invoice;

          if (billing_reason === 'subscription_cycle' && [1, 3, 5, 7, 8].includes(attempt_count)) {
            logger.warn(`payement recurrant echouer => ${customer}`);
            const subStore = sub_store(customer, undefined, true);
            if (!subStore?.payment) {
              const { payment_method_details } = await stripe.charges.retrieve(charge?.toString());
              subStore.payment = get_payment_props(payment_method_details);
            }
            const startPurchase = new Date(created * 1000);
            const purchase_end = new Date(startPurchase);
            purchase_end.setDate(startPurchase.getDate() + 14);
            const UserServices = Container.get(UsersServiceFile);
            // send mail to user
            const { email, role, firstName } = await UserServices.subscribeUser({ customer }, { subscribe_status: 'waiting' });
            if (!email) {
              stripe.subscriptions.cancel(subscription as string);
              return;
            }
            const MailerService = Container.get(MailerServiceFile);
            MailerService.Failed_subscription({
              email: email,
              name_plan: role?.toLocaleUpperCase() as role,
              payment_data: subStore.payment,
              invoice_link: hosted_invoice_url,
              purchase_end: purchase_end.toLocaleDateString('fr-FR').toString(),
              user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
            });
          }
        }

        // >>>>>>>>>> checkout.subscription.deleted
        if (event.type === 'customer.subscription.deleted') {
          logger.info(`customer.subscription.deleted =>`);
          const session: Stripe.Subscription = event.data.object;
          const {
            customer,
            ended_at,
            items: {
              data: [
                {
                  price: { unit_amount },
                },
              ],
            },
          } = session;

          const UserServices = Container.get(UsersServiceFile);
          const userUpdate = await UserServices.subscribeUser(
            { customer },
            { role: 'free', subscribe_status: 'disable', subscribe_end: new Date(new Date().toISOString()) },
          );
          if (!userUpdate) {
            return;
          }
          const MailerService = Container.get(MailerServiceFile);
          MailerService.Delete_subscription({
            email: userUpdate.email,
            plan: userUpdate.role.toLocaleUpperCase() as role,
            invoice_amount: `${(unit_amount / 100).toFixed(2).replace('.', ',')}€`,
            invoice_date: new Date(ended_at * 1000).toLocaleDateString('fr-FR'),
            user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
          });
          const token = await createToken(userUpdate);
          StoredSocket.socketIo.ioSendTo({ userId: userUpdate.id.toString() }, 'delete_subscribe', {
            value: { cookie: refreshCookie(userUpdate), token },
            text: 'Votre abonnement a pris fin',
            date: new Date().toLocaleDateString('fr-FR').toString(),
          });
        }
        // >>>>>>>>>> checkout.subscription.updated
        if (event.type === 'customer.subscription.updated') {
          logger.info(`customer.subscription.updated  =>`);
          const session: Stripe.Subscription = event.data.object;
          const {
            customer,
            cancel_at,
            cancel_at_period_end,
            items: {
              data: [
                {
                  price: {
                    unit_amount,
                    metadata: { sub_id },
                  },
                },
              ],
            },
          } = session;

          if (cancel_at_period_end) {
            const UserService = Container.get(UsersServiceFile);
            const { email, firstName, id } = await UserService.subscribeUser(
              { customer },
              {
                subscribe_status: 'pending',
              },
            );
            if (!email) {
              return;
            }
            const MailerService = Container.get(MailerServiceFile);
            const endData = new Date(cancel_at * 1000).toLocaleDateString('fr-FR').toString();
            MailerService.Cancel_request({
              email: email,
              plan: sub_id?.toLocaleUpperCase() as role,
              invoice_amount: `${(unit_amount / 100).toFixed(2).replace('.', ',')}€`,
              cancel_date: endData,
              user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
            });
            StoredSocket.socketIo.ioSendTo({ userId: id.toString() }, 'cancel_subscribe', {
              text: `Vous avez annulé votre abonnement, celui-ci prendra fin le ${endData}`,
              date: new Date().toLocaleDateString('fr-FR').toString(),
            });
            return;
          }
        }

        // >>>>>>>>>> checkout.payment_succeeded
        if (event.type === 'invoice.payment_succeeded') {
          logger.info(`invoice.payment_succeeded =>`);
          const Invoice: Stripe.Invoice = event.data.object;
          const {
            customer,
            billing_reason,
            hosted_invoice_url,
            amount_paid,
            effective_at,
            id,
            lines: { data },
          } = Invoice;
          if (!data.length) {
            return;
          }

          if (billing_reason === 'subscription_create') {
            const [{ price: newSub, period: newPeriod }] = data;
            sub_store(customer, {
              invoice_link: hosted_invoice_url,
              sub_end: new Date(newPeriod.end * 1000),
              role: newSub.metadata?.sub_id as role,
              period_plan: newSub.recurring,
            });
            return;
          }
          const subStore = sub_store(customer, undefined, true);
          const MailerService = Container.get(MailerServiceFile);
          const UserService = Container.get(UsersServiceFile);
          if (billing_reason === 'subscription_cycle' && data.length) {
            const [{ price: newSub, period: newPeriod }] = data;
            const { email, firstName, id } = await UserService.subscribeUser(
              { customer },
              {
                role: newSub.metadata?.sub_id as role,
                subscribe_end: new Date(newPeriod.end * 1000),
                subscribe_status: 'active',
              },
            );
            if (subStore?.payment && subStore.payment.dangerous) {
              logger.warn(`Eventuelle fraude détecter !!!!
              Customer => ${customer}
              Invoice Id => ${id}
            `);
            }
            MailerService.Invoice({
              email,
              invoice_link: hosted_invoice_url as string,
              invoice_amount: `${(amount_paid / 100).toFixed(2).replace('.', ',')}€`,
              invoice_date: effective_at * 1000,
              user: firstName.toLowerCase().charAt(0).toUpperCase() + firstName.toLowerCase().slice(1),
            });
            StoredSocket.socketIo.ioSendTo({ userId: id.toString() }, 'subscription_cycle', {
              text: "Votre facture de renouvellement d'abonnement vous a été envoyée par mail",
              date: new Date().toLocaleDateString('fr-FR').toString(),
            });
            return;
          }
          if (billing_reason === 'subscription_update' && data.length === 2) {
            const [{ price: oldSub }, { price: newSub, period: newPeriod }] = data;

            const userUpdate = await UserService.subscribeUser(
              { customer },
              {
                role: newSub.metadata?.sub_id as role,
                subscribe_end: new Date(newPeriod.end * 1000),
                subscribe_status: 'active',
              },
            );
            if (subStore?.payment && subStore.payment.dangerous) {
              logger.warn(`Eventuelle fraude détecter !!!!
                Customer => ${customer}
                Invoice Id => ${id}
              `);
            }
            new PatchLimit(userUpdate);

            MailerService.Update_subscription({
              email: userUpdate.email,
              old_name_plan: oldSub.metadata?.sub_id?.toLocaleUpperCase() as role,
              old_price_plan: `${(oldSub.unit_amount / 100).toFixed(2).replace('.', ',')}€`,
              old_period_plan: serialize_recurring(oldSub.recurring, false),
              new_name_plan: newSub.metadata?.sub_id?.toLocaleUpperCase() as role,
              new_price_plan: `${(newSub.unit_amount / 100).toFixed(2).replace('.', ',')}€`,
              new_period_plan: serialize_recurring(newSub.recurring, true),
              next_invoice_date: new Date(newPeriod.end * 1000).toLocaleDateString('fr-FR'),
              invoice_link: hosted_invoice_url,
              user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
            });

            const token = await createToken(userUpdate);
            StoredSocket.socketIo.ioSendTo({ userId: userUpdate.id.toString() }, 'payment_success', {
              value: { cookie: refreshCookie(userUpdate), token },
              text: `Vous avez changer d'abonnement, afin de passer au plan ${newSub.metadata?.sub_id?.toLocaleUpperCase()}`,
              date: new Date().toLocaleDateString('fr-FR').toString(),
            });
          }
        }
        // >>>>>>>>>> checkout.session.completed
        if (event.type === 'checkout.session.completed') {
          logger.info(`checkout.session.completed =>`);
          const session: Stripe.Checkout.Session = event.data.object;
          const { customer, client_reference_id, created, payment_status, amount_subtotal, status, invoice } = session;
          const { sub_end, role, payment, invoice_link, period_plan } = sub_store(customer, undefined, true);
          if (status !== 'complete' || payment_status !== 'paid' || !invoice_link) {
            logger.error('There is an error on the subscription session.');
            return;
          }
          if (payment && payment.dangerous) {
            logger.warn(`Eventuelle fraude détecter !!!!
              Customer => ${customer}
              Invoice Id => ${invoice}
            `);
          }
          const UserServices = Container.get(UsersServiceFile);
          const userUpdate = await UserServices.subscribeUser(
            { userId: Number.parseInt(client_reference_id, 10) },
            {
              stripeCustomer: customer,
              subscribe_start: new Date(created * 1000),
              subscribe_end: sub_end,
              role: role,
              subscribe_status: 'active',
            },
          );
          if (!userUpdate) {
            logger.error('The user could not be updated in the session.checkout part.');
            return;
          }
          new PatchLimit(userUpdate);
          const MailerService = Container.get(MailerServiceFile);
          MailerService.New_invoice({
            email: userUpdate.email,
            invoice_link,
            invoice_amount: `${(amount_subtotal / 100).toFixed(2).replace('.', ',')}€`,
            invoice_next_date: sub_end.toLocaleDateString('fr-FR'),
            period_plan: serialize_recurring(period_plan, true),
            name_plan: role.toLocaleUpperCase(),
            user: userUpdate.firstName.toLowerCase().charAt(0).toUpperCase() + userUpdate.firstName.toLowerCase().slice(1),
          });
          const token = await createToken(userUpdate);
          StoredSocket.socketIo.ioSendTo({ userId: userUpdate.id.toString() }, 'payment_success', {
            value: { cookie: refreshCookie(userUpdate), token, plan: role.toLocaleLowerCase() },
            text: `Vous avez souscris au plan d'abonnement ${role.toLocaleUpperCase()}`,
            date: new Date().toLocaleDateString('fr-FR').toString(),
          });
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
