import config from '@/config';
import type { APIServicesJest, AuthServicesJest, UserServicesJest } from '@/interfaces/jest';
import UserServiceFile from '@/services/users';
import request from 'supertest';
import Container from 'typedi';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import checkOAuthMiddleWareMocked from '../jest-helpers/middlewares/googleOauth';
import apiMockedService from '../jest-helpers/spy-services/api';
import authMockedService from '../jest-helpers/spy-services/auth';
import userMockedService from '../jest-helpers/spy-services/users';

checkOAuthMiddleWareMocked();
describe('GET /oAuth', () => {
  const oAuthRequest = (query?: object) => {
    const req = request(global.app).get('/api/auth/oAuth');
    if (query) {
      req.query(query);
    }
    return req;
  };

  const UserService = Container.get(UserServiceFile);

  let GetUser: UserServicesJest['getUser'];
  let Register: AuthServicesJest['register'];
  let CreateBrevoUser: APIServicesJest['createBrevoUser'];

  beforeEach(() => {
    checkOAuthMiddleWareMocked();
    GetUser = userMockedService().getUser;
    Register = authMockedService().register;
    CreateBrevoUser = apiMockedService().createBrevoUser.mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Votre token est invalide)', async () => {
    const response = await oAuthRequest();

    expect(response.status).toBe(422);
    expect(GetUser).not.toHaveBeenCalled();
    expect(Register).not.toHaveBeenCalled();
    expect(CreateBrevoUser).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Votre token est invalide');
  });

  //; Invalid google address
  it('Invalid google address => 401 error', async () => {
    const response = await oAuthRequest({ email: 'myIncorrectAddressMail@gmail.com' }).set('Authorization', `Bearer fakeToken`);

    expect(response.status).toBe(401);
    expect(GetUser).not.toHaveBeenCalled();
    expect(Register).not.toHaveBeenCalled();
    expect(CreateBrevoUser).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe("La connexion OAuth n'a pas été validée par Google");
  });

  //; Correct google address
  it('Correct google address => status 200 / auth cookie', async () => {
    const response = await oAuthRequest({ email: 'providerAccount@gmail.com' }).set('Authorization', `Bearer fakeToken`);

    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    expect(response.status).toBe(200);
    expect(GetUser).toHaveBeenNthCalledWith(1, { email: 'providerAccount@gmail.com', oAuthAccount: true }, ['id', 'role', 'createdAt']);
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(typeof cookie.refreshToken).toBe('string');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe('5');
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('free');

    expect(Register).not.toHaveBeenCalled();
    expect(CreateBrevoUser).not.toHaveBeenCalled();
    expect(response.body).toEqual({ role: 'free', email: 'providerAccount@gmail.com', createdAt: expect.any(String) });
  });

  //; Correct new google address
  it('Correct new google address => status 200 / auth cookie', async () => {
    const response = await oAuthRequest({ email: 'NewproviderAccount@gmail.com' }).set('Authorization', `Bearer fakeToken`);

    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];
    const { total } = await UserService.findUsers();

    expect(response.status).toBe(200);
    expect(GetUser).toHaveBeenNthCalledWith(1, { email: 'NewproviderAccount@gmail.com', oAuthAccount: true }, ['id', 'role', 'createdAt']);
    expect(Register).toHaveBeenNthCalledWith(1, { email: 'NewproviderAccount@gmail.com', firstName: 'new', lastName: 'provider' }, expect.anything());
    expect(CreateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'NewproviderAccount@gmail.com',
      firstName: 'new',
      lastName: 'provider',
      google: false,
    });
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(typeof cookie.refreshToken).toBe('string');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(String(total));
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('free');

    expect(response.body).toEqual({ role: 'free', email: 'NewproviderAccount@gmail.com', createdAt: expect.any(String) });
  });
});
