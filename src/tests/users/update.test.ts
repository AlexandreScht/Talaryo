import config from '@/config';
import { APIServicesJest, UserServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import UserServiceFile from '@/services/users';
import request from 'supertest';
import Container from 'typedi';
import { authCookie, getSignedCookieValue } from '../jest-helpers/cookie';
import apiMockedService from '../jest-helpers/spy-services/api';
import userMockedService from '../jest-helpers/spy-services/users';

describe('PATCH users/update', () => {
  const updateUserRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).patch('/api/users/update').set('Cookie', authCookieValue);
    }
    return request(global.app).patch('/api/users/update');
  };

  const UserService = Container.get(UserServiceFile);

  let updateUsers: UserServicesJest['updateUsers'];
  let updateBrevoUser: APIServicesJest['updateBrevoUser'];

  beforeEach(() => {
    updateUsers = userMockedService().updateUsers;
    updateBrevoUser = apiMockedService().updateBrevoUser.mockResolvedValue();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await UserService.updateUsers({ id: 12 }, { firstName: 'Alexandre', lastName: 'Scht', society: 'public', role: 'free' });
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await updateUserRequest();

    expect(response.status).toBe(999);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; Without values
  it('Without values => 422 error ( Une valeur au minimum est requise )', async () => {
    const response = await updateUserRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Une valeur au minimum est requise !');
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await updateUserRequest({ refreshToken: 'refreshToken', sessionId: 12, sessionRole: 'free' }).send({
      firstName: 1478,
      society: true,
      lastName: ['oui'],
      role: 'operateur',
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      "Invalid type for keys: body.society: Expected string, received boolean - body.role: Invalid enum value. Expected 'admin' | 'business' | 'pro' | 'free', received 'operateur' - body.firstName: Expected string, received number - body.lastName: Expected string, received array",
    );
  });

  //; Update firstName
  it('Update firstName => 200 status / auth cookie / { role: free }', async () => {
    const response = await updateUserRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      firstName: 'Ir0ws',
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 12,
      },
      { firstName: 'Ir0ws', role: 'free' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.firstName).toBe('Ir0ws');
    expect(updateUser.lastName).toBe('Scht');
    expect(updateUser.society).toBe('public');
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(cookie.refreshToken).toBe('fakeRefreshToken');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(12);
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('free');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, { email: 'updateUser@gmail.com', firstName: 'Ir0ws', lastName: 'Scht', society: 'public' });
    expect(response.body.role).toBe('free');
  });

  //; Update lastName
  it('Update lastName => 200 status / auth cookie / { role: free }', async () => {
    const response = await updateUserRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      lastName: 'Patrick',
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 12,
      },
      { lastName: 'Patrick', role: 'free' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.lastName).toBe('Patrick');
    expect(updateUser.firstName).toBe('Alexandre');
    expect(updateUser.society).toBe('public');
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(cookie.refreshToken).toBe('fakeRefreshToken');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(12);
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('free');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'updateUser@gmail.com',
      firstName: 'Alexandre',
      lastName: 'Patrick',
      society: 'public',
    });
    expect(response.body.role).toBe('free');
  });

  //; Update society
  it('Update society => 200 status / auth cookie / { role: free }', async () => {
    const response = await updateUserRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      society: 'Talaryo',
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 12,
      },
      { society: 'Talaryo', role: 'free' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.society).toBe('Talaryo');
    expect(updateUser.firstName).toBe('Alexandre');
    expect(updateUser.lastName).toBe('Scht');
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(cookie.refreshToken).toBe('fakeRefreshToken');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(12);
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('free');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'updateUser@gmail.com',
      firstName: 'Alexandre',
      lastName: 'Scht',
      society: 'Talaryo',
    });
    expect(response.body.role).toBe('free');
  });

  //; Update role
  it('Update role => 200 status / auth cookie / { role: pro }', async () => {
    const response = await updateUserRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      role: 'pro',
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 12,
      },
      { role: 'pro' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.society).toBe('public');
    expect(updateUser.firstName).toBe('Alexandre');
    expect(updateUser.lastName).toBe('Scht');
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(cookie.refreshToken).toBe('fakeRefreshToken');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(12);
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('pro');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'updateUser@gmail.com',
      firstName: 'Alexandre',
      lastName: 'Scht',
      society: 'public',
    });
    expect(response.body.role).toBe('pro');
  });

  //; Update all values
  it('Update all values => 200 status / auth cookie / { role: pro }', async () => {
    const response = await updateUserRequest({ refreshToken: 'fakeRefreshToken', sessionId: 12, sessionRole: 'free' }).send({
      role: 'pro',
      firstName: 'Ir0ws',
      lastName: 'Criquet',
      society: 'JobFinder',
    });

    expect(response.status).toBe(200);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: 12,
      },
      { role: 'pro', firstName: 'Ir0ws', lastName: 'Criquet', society: 'JobFinder' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );
    const cookie = getSignedCookieValue<Record<string, { refreshToken: string; sessionId: number; sessionRole: role }>>(
      response,
      config.COOKIE_NAME,
    )?.[config.COOKIE_NAME];

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.society).toBe('JobFinder');
    expect(updateUser.firstName).toBe('Ir0ws');
    expect(updateUser.lastName).toBe('Criquet');
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('refreshToken');
    expect(cookie.refreshToken).toBe('fakeRefreshToken');
    expect(cookie).toHaveProperty('sessionId');
    expect(cookie.sessionId).toBe(12);
    expect(cookie).toHaveProperty('sessionRole');
    expect(cookie.sessionRole).toBe('pro');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, {
      email: 'updateUser@gmail.com',
      firstName: 'Ir0ws',
      lastName: 'Criquet',
      society: 'JobFinder',
    });
    expect(response.body.role).toBe('pro');
  });
});
