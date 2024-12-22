import type { APIServicesJest, AuthServicesJest, MailerServicesJest, UserServicesJest } from '@/interfaces/jest';
import MailerServiceFile from '@/services/mailer';
import UserServiceFile from '@/services/users';
import request from 'supertest';
import Container from 'typedi';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import captchaMiddleWareMocked from '../jest-helpers/middlewares/captcha';
import apiMockedService from '../jest-helpers/spy-services/api';
import authMockedService from '../jest-helpers/spy-services/auth';
import mailerMockedService from '../jest-helpers/spy-services/mailer';
import userMockedService from '../jest-helpers/spy-services/users';

captchaMiddleWareMocked();
describe('POST auth/register', () => {
  const registerRequest = () => request(global.app).post('/api/auth/register');

  const UserService = Container.get(UserServiceFile);

  let generateCodeAccess: UserServicesJest['generateCodeAccess'];
  let getUser: UserServicesJest['getUser'];
  let registration: MailerServicesJest['Registration'];
  let register: AuthServicesJest['register'];
  let createBrevoUser: APIServicesJest['createBrevoUser'];

  beforeEach(() => {
    captchaMiddleWareMocked();
    register = authMockedService().register;
    getUser = userMockedService().getUser;
    generateCodeAccess = userMockedService().generateCodeAccess;
    registration = mailerMockedService().Registration.mockResolvedValue();
    createBrevoUser = apiMockedService().createBrevoUser.mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await registerRequest().send({
      email: 'invalidemail',
      password: '_',
      confirm: '_',
      firstName: undefined,
      lastName: undefined,
      token: undefined,
    });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(
      'Invalid type for keys: body.password: Le mot de passe doit contenir au moins 8 caractères - body.password: Le mot de passe doit contenir au moins 1 lettre majuscule, 1 lettre minuscule et 1 caractère spécial - body.email: Adresse e-mail invalide - body.token: Le type attendu est un string - body.firstName: Le type attendu est un string - body.lastName: Le type attendu est un string',
    );
  });

  //; Existing user validate account register test
  it('Existing user validate account register test => 201 status / body true / fake access_cookie', async () => {
    const res = await registerRequest().send({
      email: 'alexandreschecht@gmail.com',
      password: 'MyPassword08!',
      confirm: 'MyPassword08!',
      firstName: 'UserName',
      lastName: 'UserName',
      token: 'fake-Token-value',
    });

    const { access_cookie } = getSignedCookieValue<{ access_cookie: { id: string; accessToken: string } }>(res, 'access_cookie');
    expect(access_cookie).toHaveProperty('id');
    expect(access_cookie).toHaveProperty('accessToken');
    expect(access_cookie.id).toBeNull();
    expect(access_cookie.accessToken).toBeNull();
    expect(createBrevoUser).not.toHaveBeenCalled();
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
    expect(registration).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'alexandreschecht@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(res.status).toBe(201);
    expect(res.body).toBe(true);
  });

  //; Existing user invalid account register test
  it('Existing user invalid account register test => 201 status / body true / correct access_cookie', async () => {
    const res = await registerRequest().send({
      email: 'notVerifyAccount@gmail.com',
      password: 'MyPassword08!',
      confirm: 'MyPassword08!',
      firstName: 'UserName',
      lastName: 'UserName',
      token: 'fake-Token-value',
    });

    const { access_cookie } = getSignedCookieValue<{ access_cookie: { id: string; accessToken: string } }>(res, 'access_cookie');
    expect(access_cookie).toBeDefined();
    expect(access_cookie).toHaveProperty('id');
    expect(access_cookie).toHaveProperty('accessToken');
    expect(access_cookie.id).toBe('2');
    expect(access_cookie.accessToken).toBeDefined();
    expect(generateCodeAccess).toHaveBeenNthCalledWith(1, '2');
    expect(createBrevoUser).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'notVerifyAccount@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(registration).toHaveBeenNthCalledWith(1, 'notVerifyAccount@gmail.com', 'UserName', expect.stringMatching(/^\d+$/));
    expect(res.status).toBe(201);
    expect(res.body).toBe(true);
  });

  //; New user register test
  it('New user register test => 201 status / body true / correct access_cookie', async () => {
    Container.set(MailerServiceFile, { test: true });
    const res = await registerRequest().send({
      email: 'myNewUserAccount@gmail.com',
      password: 'MyPassword08!',
      confirm: 'MyPassword08!',
      firstName: 'newUser',
      lastName: 'UserName',
      token: 'fake-Token-value',
    });

    const { total } = await UserService.findUsers();

    const { access_cookie } = getSignedCookieValue<{ access_cookie: { id: string; accessToken: string } }>(res, 'access_cookie');

    expect(access_cookie).toBeDefined();
    expect(access_cookie).toHaveProperty('id');
    expect(access_cookie).toHaveProperty('accessToken');
    expect(access_cookie.id).toBe(String(total));
    expect(access_cookie.accessToken).toBeDefined();
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'myNewUserAccount@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(register).toHaveBeenNthCalledWith(
      1,
      {
        email: 'myNewUserAccount@gmail.com',
        password: 'MyPassword08!',
        firstName: 'newUser',
        lastName: 'UserName',
      },
      expect.anything(),
    );
    expect(createBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'myNewUserAccount@gmail.com',
      firstName: 'newUser',
      lastName: 'UserName',
      google: false,
    });
    expect(registration).toHaveBeenNthCalledWith(1, 'myNewUserAccount@gmail.com', 'newUser', expect.stringMatching(/^\d+$/));
    expect(res.status).toBe(201);
    expect(res.body).toBe(true);
  });
});
