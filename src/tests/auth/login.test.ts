import config from '@/config';
import type { AuthServicesJest, MailerServicesJest, UserServicesJest } from '@/interfaces/jest';
import request from 'supertest';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import authMockedService from '../jest-helpers/spy-services/auth';
import mailerMockedService from '../jest-helpers/spy-services/mailer';
import userMockedService from '../jest-helpers/spy-services/users';

describe('POST auth/login', () => {
  const loginRequest = () => request(global.app).post('/api/auth/login');

  let generateCodeAccess: UserServicesJest['generateCodeAccess'];
  let generateTokenAccess: UserServicesJest['generateTokenAccess'];
  let getUser: UserServicesJest['getUser'];
  let TwoFactorAuthenticate: MailerServicesJest['TwoFactorAuthenticate'];
  let login: AuthServicesJest['login'];

  beforeEach(() => {
    login = authMockedService().login;
    getUser = userMockedService().getUser;
    generateCodeAccess = userMockedService().generateCodeAccess;
    generateTokenAccess = userMockedService().generateTokenAccess;
    TwoFactorAuthenticate = mailerMockedService().TwoFactorAuthenticate.mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await loginRequest().send({
      email: 'alexandre',
      password: 'mypass',
      token: 'fakeCaptchaToken',
    });

    expect(response.status).toBe(422);
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid type for keys: body.email: Adresse e-mail invalide');
  });

  //; With incorrect credentials email
  it('With incorrect credentials email => 401 error (Invalid email credentials)', async () => {
    const response = await loginRequest().send({
      email: 'alexandroschecht@gmail.com',
      password: 'MyPassword08!',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'alexandroschecht@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email ou mot de passe incorrect !');
  });

  //; With incorrect credentials password
  it('With incorrect credentials password => 401 error (Invalid password credentials)', async () => {
    const response = await loginRequest().send({
      email: 'alexandreschecht@gmail.com',
      password: 'myPassword',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'alexandreschecht@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(login).toHaveBeenNthCalledWith(
      1,
      {
        id: '1',
        validate: true,
        password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
        role: 'admin',
        twoFactorType: null,
        firstName: 'Alexandre',
        checkPassword: expect.any(Function),
      },
      'myPassword',
    );
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email ou mot de passe incorrect !');
  });

  //; With correct credentials and invalidate account
  it('With correct credentials and invalidate account => 403 error (Invalid account)', async () => {
    const response = await loginRequest().send({
      email: 'notVerifyAccount@gmail.com',
      password: 'MyPassword08!',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'notVerifyAccount@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(login).toHaveBeenNthCalledWith(
      1,
      {
        id: '2',
        validate: false,
        password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
        role: 'free',
        twoFactorType: null,
        firstName: 'user',
        checkPassword: expect.any(Function),
      },
      'MyPassword08!',
    );
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Veuillez valider votre compte par e-mail.');
  });

  //; With correct credentials and valid account
  it('With correct credentials and valid account => 200 status (valid account)', async () => {
    const response = await loginRequest().send({
      email: 'alexandreschecht@gmail.com',
      password: 'MyPassword08!',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'alexandreschecht@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(login).toHaveBeenNthCalledWith(
      1,
      {
        id: '1',
        validate: true,
        password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
        role: 'admin',
        twoFactorType: null,
        firstName: 'Alexandre',
        checkPassword: expect.any(Function),
      },
      'MyPassword08!',
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(typeof cookie.refreshToken).toBe('string');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe('1');
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('admin');

    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('role');
    expect(response.body.role).toBe('admin');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe('alexandreschecht@gmail.com');
  });

  //; With correct credentials / valid account / 2FA email activated
  it('With correct credentials / valid account / 2FA email activated => 200 status (valid account 2FA (email))', async () => {
    const response = await loginRequest().send({
      email: 'emailTwoAutenticate@gmail.com',
      password: 'MyPassword08!',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'emailTwoAutenticate@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(login).toHaveBeenNthCalledWith(
      1,
      {
        id: '6',
        validate: true,
        password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
        role: 'admin',
        twoFactorType: 'email',
        firstName: 'Alexandre',
        checkPassword: expect.any(Function),
      },
      'MyPassword08!',
    );

    const cookie = getSignedCookieValue<{ TwoFA_cookie: { accessToken: string; id: number; twoFA: 'email' } }>(
      response,
      'TwoFA_cookie',
    )?.TwoFA_cookie;

    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('accessToken');
    expect(typeof cookie.accessToken).toBe('string');
    expect(cookie).toHaveProperty('id');
    expect(cookie.id).toBe('6');
    expect(cookie).toHaveProperty('twoFA');
    expect(cookie.twoFA).toBe('email');

    expect(generateCodeAccess).toHaveBeenNthCalledWith(1, '6', 6);
    expect(TwoFactorAuthenticate).toHaveBeenNthCalledWith(1, 'emailTwoAutenticate@gmail.com', 'Alexandre', expect.stringMatching(/^\d+$/));
    expect(generateTokenAccess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('TwoFA');
    expect(response.body.TwoFA).toBe('email');
  });

  //; With correct credentials / valid account / 2FA authenticator activated
  it('With correct credentials / valid account / 2FA authenticator activated => 200 status (valid account 2FA (authenticator))', async () => {
    const response = await loginRequest().send({
      email: 'autenticathorTwoAutenticate@gmail.com',
      password: 'MyPassword08!',
      token: 'fakeCaptchaToken',
    });

    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'autenticathorTwoAutenticate@gmail.com', oAuthAccount: false }, [
      'id',
      'validate',
      'password',
      'role',
      'twoFactorType',
      'firstName',
    ]);
    expect(login).toHaveBeenNthCalledWith(
      1,
      {
        id: '7',
        validate: true,
        password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
        role: 'admin',
        twoFactorType: 'authenticator',
        firstName: 'Alexandre',
        checkPassword: expect.any(Function),
      },
      'MyPassword08!',
    );

    const cookie = getSignedCookieValue<{ TwoFA_cookie: { accessToken: string; id: number; twoFA: 'authenticator' } }>(
      response,
      'TwoFA_cookie',
    )?.TwoFA_cookie;

    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('accessToken');
    expect(typeof cookie.accessToken).toBe('string');
    expect(cookie).toHaveProperty('id');
    expect(cookie.id).toBe('7');
    expect(cookie).toHaveProperty('twoFA');
    expect(cookie.twoFA).toBe('authenticator');

    expect(generateTokenAccess).toHaveBeenNthCalledWith(1, '7');
    expect(TwoFactorAuthenticate).not.toHaveBeenCalled();
    expect(generateCodeAccess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('TwoFA');
    expect(response.body.TwoFA).toBe('authenticator');
  });
});
