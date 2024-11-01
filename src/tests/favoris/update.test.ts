import type { FavorisServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favorisMockedService from '../jest-helpers/spy-services/favoris';

describe('PATCH favoris/update/:id', () => {
  const updateFavRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).patch(`/api/favoris/update/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let updateFav: FavorisServicesJest['updateFav'];

  beforeEach(() => {
    updateFav = favorisMockedService().updateFav;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await updateFavRequest('1');

    expect(response.status).toBe(999);
    expect(updateFav).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await updateFavRequest('azerty', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: false,
      resume: ['histoire'],
      img: 1548,
      favFolderId: { id: 5 },
    });

    expect(response.status).toBe(422);
    expect(updateFav).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: body.link: Expected string, received boolean - body.resume: Expected string, received array - body.img: Expected string, received number - body.favFolderId: Expected number, received object - params.id: Expected number, received nan',
    );
  });

  //; update a favorite with incorrect userId
  it('update a favorite with incorrect userId => status 201 / false ', async () => {
    const response = await updateFavRequest('1', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' }).send({
      link: 'http://newLink.com',
      resume: 'update Resume',
      favFolderId: 4,
    });
    expect(response.status).toBe(201);
    expect(updateFav).toHaveBeenNthCalledWith(
      1,
      {
        link: 'http://newLink.com',
        resume: 'update Resume',
        favFolderId: 4,
      },
      1,
      5,
    );
    expect(response.text).toBe('false');
  });

  //; update a favorite
  it('update a favorite => status 204 / true ', async () => {
    const response = await updateFavRequest('1', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'http://newLink.com',
      resume: 'update Resume',
      deleted: true,
      favFolderId: 4,
    });

    expect(response.status).toBe(204);
    expect(updateFav).toHaveBeenNthCalledWith(
      1,
      {
        link: 'http://newLink.com',
        resume: 'update Resume',
        favFolderId: 4,
        deleted: true,
      },
      1,
      1,
    );
  });

  //; update a non-existing favorite
  it('update a non-existing favorite => status 201 / false ', async () => {
    const response = await updateFavRequest('10', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'http://newLink.com',
      resume: 'update Resume',
      favFolderId: 4,
    });
    expect(response.status).toBe(201);
    expect(updateFav).toHaveBeenNthCalledWith(
      1,
      {
        link: 'http://newLink.com',
        resume: 'update Resume',
        favFolderId: 4,
      },
      10,
      1,
    );

    expect(response.text).toBe('false');
  });
});
