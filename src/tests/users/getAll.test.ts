import { UserServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import userMockedService from '../jest-helpers/spy-services/users';

describe('GET users/getAll', () => {
  const getAllUserRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/users/getAll').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/users/getAll');
  };

  let findUsers: UserServicesJest['findUsers'];

  beforeEach(() => {
    findUsers = userMockedService().findUsers;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getAllUserRequest();

    expect(response.status).toBe(999);
    expect(findUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      role: 'operateur',
    });

    expect(response.status).toBe(422);
    expect(findUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      "Invalid type for keys: query.role: Invalid enum value. Expected 'admin' | 'business' | 'pro' | 'free', received 'operateur'",
    );
  });

  //; findUsers with incorrect values
  it('findUsers with incorrect values => status 201 / { meta: { results: [], total: 0 }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 'Albert',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: { firstName: 'Albert', lastName: undefined, email: undefined, role: undefined },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 0);
    expect(response.body.meta.results.length).toBe(0);
  });

  //; findUsers by firstName
  it('findUsers by firstName => status 201 / { meta: { results, total }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 'user',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: { firstName: 'user', lastName: undefined, email: undefined, role: undefined },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 5);
  });

  //; findUsers by lastName
  it('findUsers by lastName => status 201 / { meta: { results, total }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      lastName: 'tree',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: { firstName: undefined, lastName: 'tree', email: undefined, role: undefined },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 1);
    expect(response.body.meta).toHaveProperty('results');
    expect(response.body.meta.results[0]).toEqual({
      email: 'providerAccount@gmail.com',
      firstName: 'user',
      id: '5',
      lastName: 'tree',
      role: 'free',
      society: null,
      subscribe_status: 'disable',
    });
  });

  //; findUsers by email
  it('findUsers by email => status 201 / { meta: { results, total }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      email: 'alexandreschecht@gmail.com',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: { firstName: undefined, lastName: undefined, email: 'alexandreschecht@gmail.com', role: undefined },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 2);
    expect(response.body.meta).toHaveProperty('results');
    expect(response.body.meta.results[0]).toEqual({
      email: 'alexandreschecht@gmail.com',
      firstName: 'Alexandre',
      id: '1',
      lastName: 'Scht',
      role: 'admin',
      society: null,
      subscribe_status: 'active',
    });
  });

  //; findUsers by role
  it('findUsers by role => status 201 / { meta: { results, total }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      role: 'admin',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: { firstName: undefined, lastName: undefined, email: undefined, role: 'admin' },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 5);
  });

  //; findUsers by all values
  it('findUsers by all values => status 201 / { meta: { results, total }}', async () => {
    const response = await getAllUserRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      email: 'alexandreschecht@gmail.com',
      firstName: 'Alexandre',
      lastName: 'Scht',
      role: 'admin',
    });

    expect(response.status).toBe(201);
    expect(findUsers).toHaveBeenNthCalledWith(1, {
      criteria: {
        email: 'alexandreschecht@gmail.com',
        firstName: 'Alexandre',
        lastName: 'Scht',
        role: 'admin',
      },
      pagination: { limit: 10, page: 1 },
    });
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('total', 1);
    expect(response.body.meta).toHaveProperty('results');
    expect(response.body.meta.results[0]).toEqual({
      email: 'alexandreschecht@gmail.com',
      firstName: 'Alexandre',
      id: '1',
      lastName: 'Scht',
      role: 'admin',
      society: null,
      subscribe_status: 'active',
    });
  });
});
