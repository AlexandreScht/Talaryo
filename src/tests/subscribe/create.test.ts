import { TokenUser } from '@/interfaces/token';
import type Stripe from 'stripe';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import stripeMocked from '../jest-helpers/spy-modules/stripe';

describe('POST subscribe/new', () => {
  const createSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).post('/api/subscribe/new').set('Cookie', authCookieValue);
    }
    return request(global.app).post('/api/subscribe/new');
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
    const response = await createSubRequest();

    expect(mockStripe.prices.retrieve).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(999);
    expect(response.body.error).toBe('Session expired');
  });

  //; Without values
  it('Without values => 422 error ( Une valeur au minimum est requise )', async () => {
    const response = await createSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' });

    expect(mockStripe.prices.retrieve).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Invalid type for keys: body.price_id: Le type attendu est un string');
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await createSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' }).send({
      price_id: 1478,
    });

    expect(mockStripe.prices.retrieve).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Invalid type for keys: body.price_id: Le type attendu est un string');
  });

  //; update incorrect userId subscription
  it('update incorrect userId subscription => 422 error (Arguments invalides)', async () => {
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 180, sessionRole: 'free' }).send({
      price_id: 'price_id',
    });

    expect(mockStripe.prices.retrieve).not.toHaveBeenCalled();
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Arguments invalides');
  });

  //; Update subscription of user
  it('Update subscription of user => 201 status / url', async () => {
    mockStripe.prices.retrieve.mockResolvedValue({ metadata: { sub_id: 'ProProfile' } } as any);
    mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'http://jest-createSub.com' } as any);
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'free' }).send({
      price_id: 'price_id',
    });

    expect(mockStripe.prices.retrieve).toHaveBeenNthCalledWith(1, 'price_id');
    expect(mockStripe.checkout.sessions.create).toHaveBeenNthCalledWith(1, {
      customer: 'cus_R9P9Mgbt5blYPQ',
      payment_method_types: ['card', 'link'],
      line_items: [
        {
          price: 'price_id',
          quantity: 1,
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      allow_promotion_codes: true,
      mode: 'subscription',
      success_url: 'http://localhost:3000/payment/successful?plan=PROPROFILE',
      cancel_url: 'http://localhost:3000/billing',
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toBe('http://jest-createSub.com');
  });
});
