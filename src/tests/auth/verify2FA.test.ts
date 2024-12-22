import config from '@/config';
import type { UserServicesJest } from '@/interfaces/jest';
import type { TwoFactorAuthenticateToken } from '@/interfaces/token';
import * as tokenUtils from '@/utils/token';
import signCookie from 'cookie-signature';
import request from 'supertest';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import userMockedService from '../jest-helpers/spy-services/users';

describe('GET auth/verify2FA', () => {
  const verify2FaRequest = (params: string, cookie?: 'expired' | TwoFactorAuthenticateToken) => {
    const agent = request(global.app).get(`/api/auth/verify2FA/${params}`);
    if (cookie) {
      const sessionToken =
        cookie === 'expired'
          ? tokenUtils.createSessionToken<object>({ id: 3, accessToken: 'MyFakeAccessToken', twoFA: 'email' }, -10)
          : tokenUtils.createSessionToken<object>(cookie, '1m');
      const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
      return agent.set('Cookie', `TwoFA_cookie=s:${signedCookieValue}`);
    }
    return agent;
  };

  let updateUsers: UserServicesJest['updateUsers'];
  let findUsers: UserServicesJest['findUsers'];

  beforeEach(() => {
    updateUsers = userMockedService().updateUsers;
    findUsers = userMockedService().findUsers;
  });

  afterEach(() => jest.restoreAllMocks());

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await verify2FaRequest('azerty');

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(findUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: params.otp: Expected number, received nan');
  });

  //; without cookie: TwoFA_cookie
  it("without cookie: TwoFA_cookie => 404 error ( Votre code d'accès est introuvable. Veuillez refaire votre demande )", async () => {
    const response = await verify2FaRequest('08');

    expect(response.status).toBe(404);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(findUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès est introuvable. Veuillez refaire votre demande.");
  });

  //; with expired cookie: TwoFA_cookie
  it('with expired cookie: TwoFA_cookie => 422 error ( Accès expiré )', async () => {
    const response = await verify2FaRequest('08', 'expired');

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(findUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Accès expiré.');
  });

  //; with incorrect accessCode (2FA mails)
  it('with incorrect accessCode (2FA mails) => 401 error ( Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect )', async () => {
    const response = await verify2FaRequest('809812', { id: 10, accessToken: 'tuperwayeMail', twoFA: 'email' });

    expect(response.status).toBe(401);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 10,
        password: { not: null },
        accessToken: 'tuperwayeMail',

        accessCode: '809812',
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
  });

  //; with incorrect accessToken (2FA mails)
  it('with incorrect accessToken (2FA mails) => 401 error ( Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect )', async () => {
    const response = await verify2FaRequest('875680', { id: 10, accessToken: 'wrongToken', twoFA: 'email' });

    expect(response.status).toBe(401);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 10,
        password: { not: null },
        accessToken: 'wrongToken',
        accessCode: '875680',
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
  });

  //; with incorrect accessToken (2FA Authenticator)
  it('with incorrect accessToken (2FA Authenticator) => 401 error ( Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect )', async () => {
    const response = await verify2FaRequest('875680', { id: 11, accessToken: 'wrongToken', twoFA: 'authenticator' });

    expect(response.status).toBe(401);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 11,
        password: { not: null },
        accessToken: 'wrongToken',
        accessCode: { not: null },
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
  });

  //; with incorrect accessCode (2FA Authenticator)
  it('with incorrect accessCode (2FA Authenticator) => 401 error ( Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect )', async () => {
    jest.spyOn(tokenUtils, 'verifyAuthenticator2FA').mockReturnValue(false);
    const response = await verify2FaRequest('875680', { id: 11, accessToken: 'tuperwayeAuth', twoFA: 'authenticator' });

    expect(response.status).toBe(401);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 11,
        password: { not: null },
        accessToken: 'tuperwayeAuth',
        accessCode: { not: null },
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
  });

  //; with correct values (2FA mails)
  it('with correct values (2FA mails) => status 200 / { email: log2FAmail@gmail.com, role: free } / clear 2FA cookie / set auth cookie', async () => {
    const response = await verify2FaRequest('875680', { id: 10, accessToken: 'tuperwayeMail', twoFA: 'email' });

    const cookie = getSignedCookieValue<any>(response, [config.COOKIE_NAME, 'TwoFA_cookie']);
    const authCookie = cookie?.[config.COOKIE_NAME];
    const TwoFA_cookie = cookie?.TwoFA_cookie;

    expect(authCookie).toBeDefined();
    expect(authCookie).toHaveProperty('refreshToken');
    expect(typeof authCookie.refreshToken).toBe('string');
    expect(authCookie).toHaveProperty('sessionId');
    expect(authCookie.sessionId).toBe(10);
    expect(authCookie).toHaveProperty('sessionRole');
    expect(authCookie.sessionRole).toBe('free');
    expect(TwoFA_cookie).toBeUndefined();
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 10,
        password: { not: null },
        accessToken: 'tuperwayeMail',
        accessCode: '875680',
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 10,
      },
      { accessCode: null, accessToken: null },
    );
    expect(response.body).toEqual({ email: 'log2FAmail@gmail.com', role: 'free', createdAt: expect.any(String) });
  });

  //; with correct values (2FA authenticator)
  it('with correct values (2FA mails) => status 200 / { email: log2FAauthenticator@gmail.com, role: free } / clear 2FA cookie / set auth cookie', async () => {
    jest.spyOn(tokenUtils, 'verifyAuthenticator2FA').mockReturnValue(true);
    const response = await verify2FaRequest('999999', { id: 11, accessToken: 'tuperwayeAuth', twoFA: 'authenticator' });

    const cookie = getSignedCookieValue<any>(response, [config.COOKIE_NAME, 'TwoFA_cookie']);
    const authCookie = cookie?.[config.COOKIE_NAME];
    const TwoFA_cookie = cookie?.TwoFA_cookie;

    expect(authCookie).toBeDefined();
    expect(authCookie).toHaveProperty('refreshToken');
    expect(typeof authCookie.refreshToken).toBe('string');
    expect(authCookie).toHaveProperty('sessionId');
    expect(authCookie.sessionId).toBe(11);
    expect(authCookie).toHaveProperty('sessionRole');
    expect(authCookie.sessionRole).toBe('free');
    expect(TwoFA_cookie).toBeUndefined();
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        id: 11,
        password: { not: null },
        accessToken: 'tuperwayeAuth',
        accessCode: { not: null },
      },
      returning: ['accessCode', 'email', 'role', 'createdAt'],
    });
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 11,
      },
      { accessToken: null },
    );
    expect(response.body).toEqual({ email: 'log2FAauthenticator@gmail.com', role: 'free', createdAt: expect.any(String) });
  });
});
