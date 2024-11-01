import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';

describe('POST subscribe/new', () => {
  const createSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).post('/api/subscribe/new').set('Cookie', authCookieValue);
    }
    return request(global.app).post('/api/subscribe/new');
  };

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await createSubRequest();

    expect(response.status).toBe(999);
    expect(response.body.error).toBe('Session expired');
  });

  //; Without values
  it('Without values => 422 error ( Une valeur au minimum est requise )', async () => {
    const response = await createSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Invalid type for keys: body.price_id: Le type attendu est un string');
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await createSubRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' }).send({
      price_id: 1478,
    });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Invalid type for keys: body.price_id: Le type attendu est un string');
  });

  //; update incorrect userId subscription
  it('update incorrect userId subscription => 422 error (Arguments invalides)', async () => {
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 180, sessionRole: 'free' }).send({
      price_id: 'price_id',
    });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Arguments invalides');
  });

  //; Update subscription of user
  it('Update subscription of user => 201 status / url', async () => {
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'free' }).send({
      price_id: 'price_id',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toBe('http://test-createSub.co');
  });
});
