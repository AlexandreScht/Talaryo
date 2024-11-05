import { APIServicesJest, MailerServicesJest, MemoryCacheJest, SocketManagerJest, UserServicesJest } from '@/interfaces/jest';
import { subscribeStripe } from '@/interfaces/stripe';
import stripeHostMocked from '@/tests/jest-helpers/middlewares/stripe';
import memoryCacheMocked from '@/tests/jest-helpers/spy-libs/memoryMock';
import SocketManagerMocked from '@/tests/jest-helpers/spy-libs/socketMock';
import apiMockedService from '@/tests/jest-helpers/spy-services/api';
import mailerMockedService from '@/tests/jest-helpers/spy-services/mailer';
import userMockedService from '@/tests/jest-helpers/spy-services/users';
import StripeWebhook from '@/webhooks/stripe';
import request from 'supertest';

SocketManagerMocked();
describe('WEBHOOK stripe/remove sub', () => {
  const customer = 'cus_R9P9Mgbt5blYPQ';
  const stripeCancelEvent = () => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'customer.subscription.updated',
        data: {
          object: {
            cancel_at_period_end: true,
            current_period_end: 1762186061,
            current_period_start: 1730650061,
            cancellation_details: {
              comment: null,
              feedback: null,
              reason: 'cancellation_requested',
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
            cancel_at: null,
            cancel_at_period_end: false,
            canceled_at: null,
            cancellation_details: {
              reason: null,
            },
          },
        },
      });
  };
  const stripeDeleteEvent = () => {
    return request(global.app)
      .post('/api/webhook/stripe')
      .set('stripe-signature', 'secret_stripe')
      .send({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            cancel_at_period_end: true,
            created: 1730650061,
            plan: {
              amount: 48000,
              metadata: { sub_id: 'pro' },
            },
            customer,
          },
        },
      });
  };

  //?socket
  let socketMocked: SocketManagerJest;

  //? service
  let updateUsers: UserServicesJest['updateUsers'];
  let updateBrevoUser: APIServicesJest['updateBrevoUser'];
  let Cancel_request: MailerServicesJest['Cancel_request'];
  let Delete_subscription: MailerServicesJest['Delete_subscription'];

  //? memoryCache
  let setMemory: MemoryCacheJest['setMemory'];
  let getMemory: MemoryCacheJest['getMemory'];
  let delMemory: MemoryCacheJest['delMemory'];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
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
    Cancel_request = mailerMockedService().Cancel_request;
    Delete_subscription = mailerMockedService().Delete_subscription;

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

  //; cancel subscription => request
  it('cancel subscription => request', async () => {
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
    getMemory.mockReturnValueOnce({ correct: true } as any).mockReturnValue(stripeValues as any);
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      id: 1,
    } as any);
    Cancel_request.mockResolvedValue();
    updateBrevoUser.mockResolvedValue();

    const response = await stripeCancelEvent();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const endDate = new Date(stripeValues.subscribe.end_at).toLocaleDateString('fr-FR');
    expect(setMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`, stripeValues);
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { stripeCustomer: customer },
      {
        subscribe_status: 'pending',
      },
      ['id', 'email', 'firstName'],
    );
    expect(Cancel_request).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      plan: 'PRO',
      invoice_amount: stripeValues.subscribe.amount,
      cancel_date: endDate,
      user: 'alexandre'.toLowerCase().charAt(0).toUpperCase() + 'alexandre'.toLowerCase().slice(1),
    });
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      tags: [11],
      removeTags: [10],
    });
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'cancel_subscribe',
      text: `Vous avez annulé votre abonnement, celui-ci prendra fin le ${endDate}`,
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  });

  //; remove subscription => delete
  it('remove subscription => delete', async () => {
    updateUsers.mockResolvedValue({
      email: 'alexandrescehcht@gmail.com',
      firstName: 'alexandre',
      id: 1,
    } as any);
    Delete_subscription.mockResolvedValue();
    updateBrevoUser.mockResolvedValue();

    const response = await stripeDeleteEvent();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    expect(delMemory).toHaveBeenNthCalledWith(1, `stripeWH.${customer}`);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { stripeCustomer: customer },
      { role: 'free', subscribe_status: 'disable', subscribe_end: new Date(new Date().toISOString()) },
      ['id', 'email', 'firstName'],
    );
    expect(Delete_subscription).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      plan: 'PRO',
      invoice_amount: '480,00€',
      cancel_date: new Date(1730650061 * 1000).toLocaleDateString('fr-FR'),
      user: 'alexandre'.toLowerCase().charAt(0).toUpperCase() + 'alexandre'.toLowerCase().slice(1),
    });
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'alexandrescehcht@gmail.com',
      tags: [6],
      removeTags: [5, 4, 11, 10],
    });
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'delete_subscribe',
      body: { refreshCookie: expect.stringMatching(/^Talaryo-SessionLocTest=s%3/), role: 'free' },
      text: `Votre abonnement a pris fin`,
      date: new Date().toLocaleDateString('fr-FR').toString(),
    });
  });
});
