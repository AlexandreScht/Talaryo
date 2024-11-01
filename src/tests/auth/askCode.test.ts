import config from '@/config';
import { MailerServicesJest, UserServicesJest } from '@/interfaces/jest';

import { createSessionToken } from '@/utils/token';
import signCookie from 'cookie-signature';
import request from 'supertest';
import { authCookie, getSignedCookieValue } from '../jest-helpers/cookie';
import mailerMockedService from '../jest-helpers/spy-services/mailer';
import userMockedService from '../jest-helpers/spy-services/users';

describe('GET auth/AskCode', () => {
  const askCodeRequest = (values: object | false | 'session') => {
    if (values === 'session') {
      const authCookieValue = authCookie({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'admin' });
      return request(global.app).get('/api/auth/askCode').set('Cookie', authCookieValue);
    }
    if (values) {
      const sessionToken = createSessionToken<object>(values, '1m');
      const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
      return request(global.app).get('/api/auth/askCode').set('Cookie', `access_cookie=s:${signedCookieValue}`);
    }
    return request(global.app).get('/api/auth/askCode');
  };

  let generateCodeAccess: UserServicesJest['generateCodeAccess'];

  let TwoFactorAuthenticate: MailerServicesJest['TwoFactorAuthenticate'];
  let registration: MailerServicesJest['Registration'];

  beforeEach(() => {
    generateCodeAccess = userMockedService().generateCodeAccess;
    registration = mailerMockedService().Registration.mockResolvedValue();
    TwoFactorAuthenticate = mailerMockedService().TwoFactorAuthenticate.mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  //; Without cookie test
  it('Without cookie test => 404 error (no cookie provided)', async () => {
    const response = await askCodeRequest(false);

    expect(response.status).toBe(404);
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(registration).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès est introuvable, veuillez vous réinscrire");
  });

  //; With fake cookie test
  it('With fake cookie test => 200 status', async () => {
    const response = await askCodeRequest({ id: null, accessToken: null });

    expect(response.status).toBe(200);
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(registration).not.toHaveBeenCalled();
    expect(response.body).toBe(true);
  });

  //; With correct cookie test
  it('With correct cookie test => 200 status / access_cookie', async () => {
    const response = await askCodeRequest({ id: 3, accessToken: 'MyFakeAccessToken' });
    const { access_cookie } = getSignedCookieValue<{ access_cookie: { id: string; accessToken: string } }>(response, 'access_cookie');

    expect(access_cookie).toBeDefined();
    expect(access_cookie).toHaveProperty('id');
    expect(access_cookie).toHaveProperty('accessToken');
    expect(access_cookie.id).toBe(3);
    expect(access_cookie.accessToken).toBeDefined();
    expect(response.status).toBe(200);
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(registration).toHaveBeenNthCalledWith(1, 'askCodeAccount@gmail.com', 'user', expect.stringMatching(/^\d+$/));
    expect(generateCodeAccess).toHaveBeenNthCalledWith(1, 3);
    expect(response.body).toBe(true);
  });

  //; With sessionId to ask 2FA code
  it('With sessionId to ask 2FA code => 200 status', async () => {
    const response = await askCodeRequest('session');

    expect(response.status).toBe(200);
    expect(generateCodeAccess).toHaveBeenNthCalledWith(1, 1, 6, true);
    expect(registration).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).toHaveBeenNthCalledWith(1, 'alexandreschecht@gmail.com', 'Alexandre', expect.stringMatching(/^\d+$/));
    expect(response.body).toBe(true);
  });
});
