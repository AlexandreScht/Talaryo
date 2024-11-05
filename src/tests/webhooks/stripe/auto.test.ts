import { MailerServicesJest, MemoryCacheJest, SocketManagerJest, UserServicesJest } from '@/interfaces/jest';
import { subscribeStripe } from '@/interfaces/stripe';
import stripeHostMocked from '@/tests/jest-helpers/middlewares/stripe';
import memoryCacheMocked from '@/tests/jest-helpers/spy-libs/memoryMock';
import SocketManagerMocked from '@/tests/jest-helpers/spy-libs/socketMock';
import stripeMocked from '@/tests/jest-helpers/spy-modules/stripe';
import mailerMockedService from '@/tests/jest-helpers/spy-services/mailer';
import userMockedService from '@/tests/jest-helpers/spy-services/users';
import StripeWebhook from '@/webhooks/stripe';
import type Stripe from 'stripe';
import request from 'supertest';

SocketManagerMocked();
describe('WEBHOOK stripe/auto sub', () => {
  const customer = 'cus_R9P9Mgbt5blYPQ';

  const stripeInvoiceEvent = (invoice: 'succeeded' | 'failed') => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: invoice === 'succeeded' ? 'invoice.payment_succeeded' : 'invoice.payment_failed',
        data: {
          object: {
            billing_reason: 'subscription_cycle',
            hosted_invoice_url:
              'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
            id: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
            status: invoice === 'succeeded' ? 'paid' : 'open',
            ...(invoice === 'failed'
              ? { webhooks_delivered_at: 1744032720, attempt_count: 5, charge: 'chargeId', created: 1730650061, subscription: 'subId' }
              : {}),
            customer,
          },
        },
      });
  };

  const stripeUpdateEvent = (invoice: 'succeeded' | 'failed') => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'customer.subscription.updated',
        data: {
          object: {
            cancel_at_period_end: false,
            current_period_end: 1762186061,
            current_period_start: 1730650061,
            cancellation_details: {
              comment: null,
              feedback: null,
              reason: null,
            },
            status: invoice === 'succeeded' ? 'active' : 'past_due',
            plan: {
              amount: 48000,
              metadata: { sub_id: 'pro' },
              nickname: 'Annuel',
            },
            customer,
          },
          previous_attributes: {},
        },
      });
  };

  const finalStripeStore = {
    correct: true,
    invoice: {
      invoiceId: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
      invoice_link:
        'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
      auto: true,
    },
    subscribe: { role: 'pro', period: 'Annuel', end_at: '03/11/2025', start_at: '03/11/2024', amount: '480,00€' },
  } as Partial<subscribeStripe>;

  //? stripe
  let mockStripe: jest.MockedObjectDeep<Stripe>;

  //?socket
  let socketMocked: SocketManagerJest;

  //? service
  let updateUsers: UserServicesJest['updateUsers'];
  let Invoice: MailerServicesJest['Invoice'];
  let Failed_subscription: MailerServicesJest['Failed_subscription'];

  //? memoryCache
  let setMemory: MemoryCacheJest['setMemory'];
  let getMemory: MemoryCacheJest['getMemory'];
  let delMemory: MemoryCacheJest['delMemory'];

  beforeEach(() => {
    jest.spyOn(StripeWebhook.prototype as any, 'isProdApp').mockResolvedValue(true);

    //? stripe
    stripeHostMocked();
    mockStripe = stripeMocked;

    //? memory
    setMemory = memoryCacheMocked().setMemory;
    getMemory = memoryCacheMocked().getMemory;
    delMemory = memoryCacheMocked().delMemory;

    //? service
    updateUsers = userMockedService().updateUsers;
    Invoice = mailerMockedService().Invoice;
    Failed_subscription = mailerMockedService().Failed_subscription;

    //?socket
    socketMocked = SocketManagerMocked();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  //; no signature provided
  it('no signature provided => error 401 ( stripe signature incorrect )', async () => {
    const response = await request(global.app).post('/api/webhook/stripe').send({
      event: 'charge.succeeded',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('stripe signature incorrect');
  });

  //; autoCycle subscription successfully => invoice event
  it('autoCycle subscription successfully => invoice event', async () => {
    const stripProps = { correct: true };

    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeInvoiceEvent('succeeded');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const stripeValues = {
      invoice: {
        invoiceId: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
        invoice_link:
          'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
        auto: true,
      },
      correct: true,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; autoCycle subscription failed => invoice event
  it('autoCycle subscription failed => invoice event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);
    mockStripe.charges.retrieve.mockResolvedValue({
      payment_method_details: { type: 'card', card: { exp_month: 12, exp_year: 2025, last4: '4242', brand: 'visa' } as any } as any,
    } as any);
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      role: 'pro',
    } as any);
    Failed_subscription.mockResolvedValue();

    const response = await stripeInvoiceEvent('failed');
    const startPurchase = new Date(1730650061 * 1000);
    const purchase_end = new Date(startPurchase);
    purchase_end.setDate(startPurchase.getDate() + 14);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    expect(mockStripe.charges.retrieve).toHaveBeenNthCalledWith(1, 'chargeId');
    expect(updateUsers).toHaveBeenNthCalledWith(1, { stripeCustomer: customer }, { subscribe_status: 'waiting' }, ['email', 'role', 'firstName']);
    expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled();
    expect(Failed_subscription).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      name_plan: 'PRO',
      payment_data: {
        payment_method: 'card',
        exp_month: 12,
        exp_year: 2025,
        card_number: '4242',
        brand: 'visa',
      },
      invoice_link:
        'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
      purchase_end: purchase_end.toLocaleDateString('fr-FR').toString(),
      user: 'alexandre'.toLowerCase().charAt(0).toUpperCase() + 'alexandre'.toLowerCase().slice(1),
    });
    expect(setMemory).not.toHaveBeenCalled();
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
  });

  //; autoCycle subscription failed => update event
  it('autoCycle subscription failed => update event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeUpdateEvent('failed');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });

    expect(setMemory).not.toHaveBeenCalled();
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
  });

  //; autoCycle subscription successfully => update event
  it('autoCycle subscription successfully => update event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeUpdateEvent('succeeded');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const stripeValues = {
      subscribe: {
        role: 'pro',
        period: 'Annuel',
        end_at: 'Mon Nov 03 2025 17:07:41 GMT+0100 (heure normale d’Europe centrale)',
        start_at: 'Sun Nov 03 2024 17:07:41 GMT+0100 (heure normale d’Europe centrale)',
        amount: `${(48000 / 100).toFixed(2).replace('.', ',')}€`,
      },
      correct: true,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; autoCycle subscription successfully => end
  it('autoCycle subscription successfully => end', async () => {
    const { invoice, ...stripProps } = finalStripeStore;
    getMemory.mockReturnValueOnce(stripProps as any).mockReturnValue({ invoice, ...stripProps } as any);
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      id: 1,
    } as any);
    Invoice.mockResolvedValue();

    const response = await stripeInvoiceEvent('succeeded');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });

    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, { invoice, ...stripProps });
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { stripeCustomer: customer },
      {
        subscribe_end: new Date(stripProps.subscribe.end_at),
        role: stripProps.subscribe.role,
        subscribe_status: 'active',
      },
      ['email', 'firstName', 'id'],
    );
    expect(Invoice).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      invoice_link: finalStripeStore.invoice.invoice_link,
      invoice_amount: finalStripeStore.subscribe.amount,
      invoice_date: new Date(finalStripeStore.subscribe.start_at).toLocaleDateString('fr-FR'),
      user: 'alexandre'.toLowerCase().charAt(0).toUpperCase() + 'alexandre'.toLowerCase().slice(1),
    });
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'subscription_cycle',
      text: "Votre facture de renouvellement d'abonnement vous a été envoyée par mail",
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  });
});
