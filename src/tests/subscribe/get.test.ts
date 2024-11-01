import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';

describe('GET subscribe/get', () => {
  const getSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/subscribe/get').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/subscribe/get');
  };

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getSubRequest();

    expect(response.status).toBe(999);
    expect(response.body.error).toBe('Session expired');
  });

  //; get user with no subscription
  it('get user with no subscription => 204 status', async () => {
    const response = await getSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' });
    expect(response.status).toBe(204);
  });

  //; get user with subscription disabled
  it('get user with subscription disabled => 204 status', async () => {
    const response = await getSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 6, sessionRole: 'free' });
    expect(response.status).toBe(204);
  });

  //; get incorrect userId subscription
  it('get incorrect userId subscription => 422 error (Arguments invalides)', async () => {
    const response = await getSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 180, sessionRole: 'free' });
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Arguments invalides');
  });

  //; get user subscription
  it('get user subscription => 200 status / subscription data', async () => {
    const response = await getSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('subId');
    expect(response.body).toHaveProperty('priceId');
    expect(response.body).toHaveProperty('itemSub');
    expect(response.body).toHaveProperty('subscribe_status');
    expect(response.body).toHaveProperty('ended_at');
    expect(response.body.subId).toBe('subId');
    expect(response.body.priceId).toBe('priceId');
    expect(response.body.itemSub).toBe('itemSub');
    expect(response.body.subscribe_status).toBe('active');
    expect(response.body.ended_at).toBe(new Date().toLocaleDateString('fr-FR'));
  });
});
