import { TokenUser } from '@/interfaces/token';
import type Stripe from 'stripe';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import stripeMocked from '../jest-helpers/spy-modules/stripe';

stripeMocked();
describe('PATCH subscribe/cancel', () => {
  const cancelSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).patch('/api/subscribe/cancel').set('Cookie', authCookieValue);
    }
    return request(global.app).patch('/api/subscribe/cancel');
  };

  let mockStripe: any;

  beforeEach(() => {
    mockStripe = stripeMocked();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // //; without auth cookie
  // it('without auth cookie => 999 error (Auth required)', async () => {
  //   const response = await cancelSubRequest();

  //   expect(response.status).toBe(999);
  //   expect(response.body.error).toBe('Session expired');
  // });

  // //; Without values
  // it('Without values => 422 error ( Une valeur au minimum est requise )', async () => {
  //   const response = await cancelSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' });

  //   expect(response.status).toBe(422);
  //   expect(response.body.error).toBe('Invalid type for keys: body.subId: Le type attendu est un string');
  // });

  // //; With incorrect values
  // it('With incorrect values => 422 error (Invalid type keys)', async () => {
  //   const response = await cancelSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' }).send({
  //     subId: 1478,
  //     option: true,
  //   });

  //   expect(response.status).toBe(422);
  //   expect(response.body.error).toBe(
  //     'Invalid type for keys: body.subId: Le type attendu est un string - body.option: Expected object, received boolean',
  //   );
  // });

  //; cancel subscription
  it('cancel subscription => 204 status', async () => {
    mockStripe.subscriptions.update.mockResolvedValue('salope vas');
    const response = await cancelSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      subId: 'subId',
    });

    expect(mockStripe.subscriptions.update).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});
