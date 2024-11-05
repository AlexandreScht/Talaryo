import { TokenUser } from '@/interfaces/token';
import type Stripe from 'stripe';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import stripeMocked from '../jest-helpers/spy-modules/stripe';

describe('PATCH subscribe/update', () => {
  const updateSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).patch('/api/subscribe/update').set('Cookie', authCookieValue);
    }
    return request(global.app).patch('/api/subscribe/update');
  };

  let mockStripe: jest.MockedObjectDeep<Stripe>;

  beforeEach(() => {
    mockStripe = stripeMocked;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await updateSubRequest();

    expect(mockStripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(999);
    expect(response.body.error).toBe('Session expired');
  });

  //; Without values
  it('Without values => 422 error ( Une valeur au minimum est requise )', async () => {
    const response = await updateSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' });

    expect(mockStripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body.error).toBe(
      'Invalid type for keys: body.price_id: Le type attendu est un string - body.itemSub: Le type attendu est un string - body.subId: Le type attendu est un string',
    );
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await updateSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' }).send({
      price_id: 1478,
      itemSub: true,
      subId: ['sub'],
    });

    expect(mockStripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body.error).toBe(
      'Invalid type for keys: body.price_id: Le type attendu est un string - body.itemSub: Le type attendu est un string - body.subId: Le type attendu est un string',
    );
  });

  //; update incorrect userId subscription
  it('update incorrect userId subscription => 422 error (Arguments invalides)', async () => {
    const response = await updateSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 180, sessionRole: 'free' }).send({
      price_id: 'price_id',
      itemSub: 'itemSub',
      subId: 'subId',
    });

    expect(mockStripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Arguments invalides');
  });

  //; Update subscription of user
  it('Update subscription of user => 201 status / url', async () => {
    mockStripe.billingPortal.sessions.create.mockResolvedValue({ url: 'jest-stripe-url' } as any);
    const response = await updateSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'free' }).send({
      price_id: 'price_id',
      itemSub: 'itemSub',
      subId: 'subId',
    });

    expect(mockStripe.billingPortal.sessions.create).toHaveBeenNthCalledWith(1, {
      customer: 'cus_R9P9Mgbt5blYPQ',
      return_url: `http://localhost:3000/billing`,
      flow_data: {
        subscription_update_confirm: {
          items: [
            {
              quantity: 1,
              price: 'price_id',
              id: 'itemSub',
            },
          ],
          subscription: 'subId',
        },
        type: 'subscription_update_confirm',
      },
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toBe('jest-stripe-url');
  });
});
