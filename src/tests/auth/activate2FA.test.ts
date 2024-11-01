import type { UserServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import * as tokenUtils from '@/utils/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import userMockedService from '../jest-helpers/spy-services/users';

describe('PATCH auth/active2FA', () => {
  const activate2FaRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).patch('/api/auth/active2FA').set('Cookie', authCookieValue);
    }
    return request(global.app).patch('/api/auth/active2FA');
  };

  let updateUsers: UserServicesJest['updateUsers'];

  beforeEach(() => {
    updateUsers = userMockedService().updateUsers;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await activate2FaRequest();

    expect(response.status).toBe(999);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 8, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Invalid type for keys: body.twoFactorType: Required 'email' | 'authenticator' - body.otp: Required number");
  });

  //; activate mail 2FA with incorrect accessCode
  it("activate mail 2FA with incorrect accessCode => 401 error ( Le code d'accès est incorrect )", async () => {
    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 8, sessionRole: 'free' }).send({
      twoFactorType: 'email',
      otp: 1515,
    });

    expect(response.status).toBe(401);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 8,
        password: { not: null },
        accessCode: String('1515'),
      },
      { twoFactorType: 'email' },
    );
    expect(response.body.error).toBe("Le code d'accès est incorrect");
  });

  //; activate authenticator 2FA without token
  it("activate authenticator 2FA without token => 500 error ( Une erreur s'est produite )", async () => {
    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 9, sessionRole: 'free' }).send({
      twoFactorType: 'authenticator',
      otp: 1515,
    });

    expect(response.status).toBe(500);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Une erreur s'est produite");
  });

  //; activate authenticator 2FA with incorrect code
  it("activate authenticator 2FA with incorrect code => 500 error ( Le code d'accès est incorrect )", async () => {
    jest.spyOn(tokenUtils, 'verifyAuthenticator2FA').mockReturnValue(false);

    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 9, sessionRole: 'free' })
      .send({
        twoFactorType: 'authenticator',
        otp: 1515,
      })
      .set('Authorization', `Bearer fakeToken`);

    expect(response.status).toBe(401);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Le code d'accès est incorrect");
  });

  //; activate mail 2FA with correct accessCode
  it('activate mail 2FA with incorrect accessCode => status 200', async () => {
    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 8, sessionRole: 'free' }).send({
      twoFactorType: 'email',
      otp: 2548,
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 8,
        password: { not: null },
        accessCode: String('2548'),
      },
      { twoFactorType: 'email' },
    );
  });

  //; activate authenticator 2FA with correct code
  it('activate authenticator 2FA with correct code => status 200', async () => {
    jest.spyOn(tokenUtils, 'verifyAuthenticator2FA').mockReturnValue(true);

    const response = await activate2FaRequest({ refreshToken: 'refreshToken', sessionId: 9, sessionRole: 'free' })
      .send({
        twoFactorType: 'authenticator',
        otp: 1515,
      })
      .set('Authorization', `Bearer fakeToken`);

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 9,
      },
      { twoFactorType: 'authenticator', accessCode: 'fakeToken' },
    );
  });
});
