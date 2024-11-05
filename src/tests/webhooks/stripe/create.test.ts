import {
  APIServicesJest,
  FavorisServicesJest,
  MailerServicesJest,
  MemoryCacheJest,
  SearchServicesJest,
  SocketManagerJest,
  UserServicesJest,
} from '@/interfaces/jest';
import { subscribeStripe } from '@/interfaces/stripe';
import stripeHostMocked from '@/tests/jest-helpers/middlewares/stripe';
import memoryCacheMocked from '@/tests/jest-helpers/spy-libs/memoryMock';
import SocketManagerMocked from '@/tests/jest-helpers/spy-libs/socketMock';
import apiMockedService from '@/tests/jest-helpers/spy-services/api';
import favorisMockedService from '@/tests/jest-helpers/spy-services/favoris';
import mailerMockedService from '@/tests/jest-helpers/spy-services/mailer';
import searchMockedService from '@/tests/jest-helpers/spy-services/searches';
import userMockedService from '@/tests/jest-helpers/spy-services/users';
import StripeWebhook from '@/webhooks/stripe';
import request from 'supertest';

SocketManagerMocked();
describe('WEBHOOK stripe/create sub', () => {
  const customer = 'cus_R9P9Mgbt5blYPQ';
  const stripeCheckedSessionEvent = (checked: 'succeeded' | 'failed') => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: '1',
            payment_status: checked === 'succeeded' ? 'paid' : 'unpaid',
            status: checked === 'succeeded' ? 'complete' : 'open',
            customer,
          },
        },
      });
  };

  const stripeInvoiceEvent = (invoice: 'succeeded' | 'failed') => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            billing_reason: 'subscription_create',
            hosted_invoice_url:
              'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
            id: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
            status: invoice === 'succeeded' ? 'paid' : 'open',
            customer,
          },
        },
      });
  };

  const stripeUpdateEvent = (update: 'succeeded' | 'failed') => {
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
              reason: update === 'succeeded' ? null : 'payment_failed',
            },
            status: 'active',
            plan: {
              amount: 48000,
              metadata: { sub_id: 'pro' },
              nickname: 'Annuel',
            },
            customer,
          },
          previous_attributes: {
            default_payment_method: null,
            status: 'incomplete',
          },
        },
      });
  };

  const finalStripeStore = {
    correct: true,
    session: { userId: 1 },
    invoice: {
      invoiceId: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
      invoice_link:
        'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
      auto: false,
    },
    subscribe: { role: 'pro', period: 'Annuel', end_at: '03/11/2025', start_at: '03/11/2024', amount: '480,00€' },
  };

  //?socket
  let socketMocked: SocketManagerJest;

  //? service
  let updateUsers: UserServicesJest['updateUsers'];
  let updateBrevoUser: APIServicesJest['updateBrevoUser'];
  let newInvoice: MailerServicesJest['New_invoice'];
  let lockInFavoris: FavorisServicesJest['lockIn'];
  let lockInSearch: SearchServicesJest['lockIn'];

  //? memoryCache
  let setMemory: MemoryCacheJest['setMemory'];
  let getMemory: MemoryCacheJest['getMemory'];
  let delMemory: MemoryCacheJest['delMemory'];

  beforeEach(() => {
    jest.spyOn(StripeWebhook.prototype as any, 'isProdApp').mockResolvedValue(true);

    //? stripe
    stripeHostMocked();

    //? memory
    setMemory = memoryCacheMocked().setMemory;
    getMemory = memoryCacheMocked().getMemory;
    delMemory = memoryCacheMocked().delMemory;

    //? service
    updateUsers = userMockedService().updateUsers;
    updateBrevoUser = apiMockedService().updateBrevoUser;
    newInvoice = mailerMockedService().New_invoice;
    lockInFavoris = favorisMockedService().lockIn;
    lockInSearch = searchMockedService().lockIn;

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

  //; create subscription failed => checked event'
  it('create subscription failed => checked event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);
    const response = await stripeCheckedSessionEvent('failed');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const stripeValues = {
      session: {
        userId: 1,
      },
      correct: false,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; create subscription failed => invoice event
  it('create subscription failed => invoice event', async () => {
    const stripProps = { correct: true };

    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeInvoiceEvent('failed');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const stripeValues = {
      invoice: {
        invoiceId: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
        invoice_link:
          'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
        auto: false,
      },
      correct: false,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; create subscription failed => update event
  it('create subscription failed => update event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeUpdateEvent('failed');

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
      correct: false,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //> success

  //; create subscription successfully => checked event'
  it('create subscription successfully => checked event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);
    const response = await stripeCheckedSessionEvent('succeeded');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const stripeValues = {
      session: {
        userId: 1,
      },
      correct: true,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; create subscription successfully => invoice event
  it('create subscription successfully => invoice event', async () => {
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
        auto: false,
      },
      correct: true,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; create subscription successfully => update event
  it('create subscription successfully => update event', async () => {
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

  //; create subscription successfully => end
  it('create subscription successfully => end', async () => {
    const { invoice, ...stripProps } = finalStripeStore;
    getMemory.mockReturnValueOnce(stripProps as any).mockReturnValue({ invoice, ...stripProps } as any);
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      id: 1,
      role: 'pro',
    } as any);
    newInvoice.mockResolvedValue();
    lockInFavoris.mockResolvedValue();
    lockInSearch.mockResolvedValue();
    updateBrevoUser.mockResolvedValue();

    const response = await stripeInvoiceEvent('succeeded');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });

    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, { invoice, ...stripProps });
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 1 },
      {
        stripeCustomer: customer,
        subscribe_start: new Date(stripProps.subscribe.start_at),
        subscribe_end: new Date(stripProps.subscribe.end_at),
        role: stripProps.subscribe.role,
        subscribe_status: 'active',
      },
      ['email', 'firstName', 'id', 'role'],
    );
    expect(newInvoice).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      invoice_link: invoice.invoice_link,
      invoice_amount: stripProps.subscribe.amount,
      invoice_next_date: new Date(stripProps.subscribe.end_at).toLocaleDateString('fr-FR'),
      period_plan: stripProps.subscribe.period,
      name_plan: stripProps.subscribe.role.toLocaleUpperCase(),
      user: 'alexandre'.toLowerCase().charAt(0).toUpperCase() + 'alexandre'.toLowerCase().slice(1),
    });
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      tags: [4, 10],
      removeTags: [5, 6, 4, 11],
    });
    expect(lockInFavoris).toHaveBeenNthCalledWith(1, 1, 100);
    expect(lockInSearch).toHaveBeenNthCalledWith(1, 1, 10);
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'payment_success',
      body: { refreshCookie: expect.stringMatching(/^Talaryo-SessionLocTest=s%3/), role: 'pro' },
      text: `Vous avez souscris au plan d'abonnement PRO`,
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
  });
});
