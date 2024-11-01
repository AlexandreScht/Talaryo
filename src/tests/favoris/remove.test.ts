import { FavorisServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favorisMockedService from '../jest-helpers/spy-services/favoris';

describe('DELETE favoris/remove/:id', () => {
  const deleteFavRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).delete(`/api/favoris/remove/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let deleteFav: FavorisServicesJest['deleteFav'];
  beforeEach(() => {
    deleteFav = favorisMockedService().deleteFav;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await deleteFavRequest('1');

    expect(response.status).toBe(999);
    expect(deleteFav).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await deleteFavRequest('azerty', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(deleteFav).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: params.id: Expected number, received nan');
  });

  //; delete a favorite with incorrect userId
  it('delete a favorite with incorrect userId => status 201 / false ', async () => {
    const response = await deleteFavRequest('1', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteFav).toHaveBeenNthCalledWith(1, 1, 5);

    expect(response.text).toBe('false');
  });

  //; delete a favorite
  it('delete a favorite => status 204 / true ', async () => {
    const response = await deleteFavRequest('1', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(204);
    expect(deleteFav).toHaveBeenNthCalledWith(1, 1, 1);
  });

  //; delete a non-existing favorite
  it('delete a non-existing favorite => status 201 / false ', async () => {
    const response = await deleteFavRequest('57', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteFav).toHaveBeenNthCalledWith(1, 57, 1);

    expect(response.text).toBe('false');
  });
});
