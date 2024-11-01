import config from '@/config';
import type { UserServicesJest } from '@/interfaces/jest';
import { createSessionToken } from '@/utils/token';
import signCookie from 'cookie-signature';
import request from 'supertest';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import userMockedService from '../jest-helpers/spy-services/users';

describe('PATCH auth/validateAccount', () => {
  const validateAccountRequest = (values: object | false | 'expired') => {
    if (values) {
      const sessionToken =
        values === 'expired'
          ? createSessionToken<object>({ id: 3, accessToken: 'MyFakeAccessToken' }, -10)
          : createSessionToken<object>(values, '1m');
      const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
      return request(global.app).patch('/api/auth/validate-account').set('Cookie', `access_cookie=s:${signedCookieValue}`);
    }
    return request(global.app).patch('/api/auth/validate-account');
  };

  let updateUsers: UserServicesJest['updateUsers'];

  beforeEach(() => {
    updateUsers = userMockedService().updateUsers;
  });

  afterEach(() => jest.restoreAllMocks());

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await validateAccountRequest(false).send({
      code: 'azerty',
    });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid type for keys: body.code: Expected number, received string');
  });

  //; Without cookie test
  it('Without cookie test => 422 error (no cookie provided)', async () => {
    const response = await validateAccountRequest(false).send({
      code: 2525,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès a expiré, veuillez en demander un nouveau.");
  });

  //; With cookie test expired
  it('With cookie test expired => 422 error (expired cookie provided)', async () => {
    const response = await validateAccountRequest('expired').send({
      code: 2525,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès a expiré, veuillez en demander un nouveau.");
  });

  //; With cookie test incomplete id
  it("With cookie test don't have id props => 422 error (incomplete id props cookie provided)", async () => {
    const response = await validateAccountRequest({ accessToken: null }).send({
      code: 2525,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Impossible de valider votre compte. Code d'accès incorrect.");
  });

  //; With cookie test incomplete accessToken
  it("With cookie test don't have accessToken props => 422 error (incomplete accessToken props cookie provided)", async () => {
    const response = await validateAccountRequest({ id: 4 }).send({
      code: 2525,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Impossible de valider votre compte. Code d'accès incorrect.");
  });

  //; With incorrect cookie test token props
  it('With incorrect cookie test token props => 422 error (incorrect accessToken props cookie provided)', async () => {
    const response = await validateAccountRequest({ id: 4, accessToken: 'myWrongAccessToken' }).send({
      code: 4848,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 4, accessToken: 'myWrongAccessToken', accessCode: '4848' },
      { accessToken: null, accessCode: null, validate: true },
    );
    expect(response.body.error).toBe("Impossible de valider votre compte. Code d'accès incorrect.");
  });

  //; With incorrect cookie test code props
  it('With incorrect cookie test code props => 422 error (incorrect accessCode provided)', async () => {
    const response = await validateAccountRequest({ id: 4, accessToken: 'MyAccessToken' }).send({
      code: 2525,
    });

    expect(response.status).toBe(422);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 4, accessToken: 'MyAccessToken', accessCode: '2525' },
      { accessToken: null, accessCode: null, validate: true },
    );
    expect(response.body.error).toBe("Impossible de valider votre compte. Code d'accès incorrect.");
  });

  //; With correct cookie test and code
  it('With correct cookie test and code => 201 status / clear access_cookie', async () => {
    const response = await validateAccountRequest({ id: 4, accessToken: 'MyAccessToken' }).send({
      code: 4848,
    });

    const value = getSignedCookieValue<{ access_cookie?: {} }>(response, 'access_cookie');
    expect(value?.access_cookie).toBeUndefined();
    expect(response.status).toBe(201);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 4, accessToken: 'MyAccessToken', accessCode: '4848' },
      { accessToken: null, accessCode: null, validate: true },
    );
    expect(response.text).toBe('Votre compte a été validé. Vous allez être redirigé vers la page de connexion.');
  });
});
