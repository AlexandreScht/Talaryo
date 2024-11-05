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
describe('WEBHOOK stripe/update sub', () => {
  const customer = 'cus_R9P9Mgbt5blYPQ';

  const stripeInvoiceEvent = (invoice: 'succeeded' | 'failed') => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            billing_reason: 'subscription_update',
            hosted_invoice_url:
              'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
            id: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
            status: invoice === 'succeeded' ? 'paid' : 'open',
            customer,
          },
        },
      });
  };

  const stripeUpdateEvent = () => {
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
            plan: {
              amount: 48000,
              metadata: { sub_id: 'pro' },
              nickname: 'Annuel',
            },
            status: 'active',
            customer,
          },
          previous_attributes: {
            plan: {
              amount: 72000,
              metadata: {
                sub_id: 'business',
              },
              product: 'prod_R9OLvRV4BxujYK',
            },
          },
        },
      });
  };

  const finalStripeStore = {
    correct: true,
    invoice: {
      invoiceId: 'in_1QH6L3GVYRCJUbrrrTz4I3wb',
      invoice_link:
        'https://invoice.stripe.com/i/acct_1OcBGnGVYRCJUbrr/test_YWNjdF8xT2NCR25HVllSQ0pVYnJyLF9SOVA5S00yWDhaTWw0Tnp4a2g4dG8yRWhrTHd2RDhNLDEyMTE5MDg2NA0200MHu6n9Vp?s=ap',
      auto: false,
    },
    subscribe: { role: 'pro', period: 'Annuel', end_at: '03/11/2025', start_at: '03/11/2024', amount: '480,00€' },
    previous: {
      role: 'business',
      amount: '720,00€',
      isComeBack: false,
    },
  } as Partial<subscribeStripe>;

  //?socket
  let socketMocked: SocketManagerJest;

  //? service
  let updateUsers: UserServicesJest['updateUsers'];
  let updateBrevoUser: APIServicesJest['updateBrevoUser'];
  let Update_subscription: MailerServicesJest['Update_subscription'];
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
    Update_subscription = mailerMockedService().Update_subscription;
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

  //; update subscription successfully => invoice event
  it('update subscription successfully => invoice event', async () => {
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

  //; update subscription successfully => update event
  it('update subscription successfully => update event', async () => {
    const stripProps = { correct: true };
    getMemory.mockReturnValue(stripProps as any);

    const response = await stripeUpdateEvent();

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
      previous: {
        role: 'business',
        amount: '720,00€',
        isComeBack: false,
      },
      correct: true,
    } as Partial<subscribeStripe>;
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).not.toHaveBeenCalled();
  });

  //; update subscription successfully => end
  it('update subscription successfully => end', async () => {
    const { invoice, ...stripProps } = finalStripeStore;
    getMemory.mockReturnValueOnce(stripProps as any).mockReturnValue({ invoice, ...stripProps } as any);
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      id: 1,
      role: 'pro',
    } as any);
    Update_subscription.mockResolvedValue();
    lockInFavoris.mockResolvedValue();
    lockInSearch.mockResolvedValue();
    updateBrevoUser.mockResolvedValue();

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
      ['email', 'firstName', 'id', 'role'],
    );
    expect(Update_subscription).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      old_name_plan: finalStripeStore.previous.role.toLocaleUpperCase(),
      old_price_plan: finalStripeStore.previous.amount,
      new_name_plan: finalStripeStore.subscribe.role.toLocaleUpperCase(),
      new_price_plan: finalStripeStore.subscribe.amount,
      new_period_plan: finalStripeStore.subscribe.period,
      next_invoice_date: new Date(finalStripeStore.subscribe.end_at).toLocaleDateString('fr-FR'),
      invoice_link: finalStripeStore.invoice.invoice_link,
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
      text: `Vous avez changer d'abonnement, afin de passer au plan PRO`,
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  });
});
