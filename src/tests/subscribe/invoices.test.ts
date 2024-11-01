import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';

describe('GET subscribe/invoices', () => {
  const createSubRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/subscribe/invoices').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/subscribe/invoices');
  };

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await createSubRequest();

    expect(response.status).toBe(999);
    expect(response.body.error).toBe('Session expired');
  });

  //; invoices of incorrect userId subscription
  it('invoices of incorrect userId subscription => 422 error (Arguments invalides)', async () => {
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 180, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Arguments invalides');
  });

  //; invoices subscription of user
  it('invoices subscription of user => 200 status / invoices', async () => {
    const response = await createSubRequest({ refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('invoices');
    expect(response.body.invoices?.length).toBe(1);
    expect(response.body.invoices[0]).toHaveProperty('price');
    expect(response.body.invoices[0]).toHaveProperty('billing');
    expect(response.body.invoices[0]).toHaveProperty('pdf');
    expect(response.body.invoices[0]).toHaveProperty('url');
    expect(response.body.invoices[0]).toHaveProperty('paid');
    expect(response.body.invoices[0]).toHaveProperty('plan');
    expect(response.body.invoices[0]).toHaveProperty('start');
    expect(response.body.invoices[0]).toHaveProperty('recurring');
    expect(response.body.invoices[0].price).toBe(150);
    expect(response.body.invoices[0].billing).toBe('Souscription');
    expect(response.body.invoices[0].pdf).toBe('pdf_link');
    expect(response.body.invoices[0].url).toBe('invoice_url');
    expect(response.body.invoices[0].paid).toBe(true);
    expect(response.body.invoices[0].plan).toBe('sub_id');
    expect(response.body.invoices[0].start).toBe(new Date().toLocaleDateString('fr-FR'));
    expect(response.body.invoices[0].recurring).toBe('3 mois');
  });
});
