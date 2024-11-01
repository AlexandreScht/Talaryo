import type { FavFolderServicesJest, FavorisServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import FavorisServiceFile from '@/services/favoris';
import request from 'supertest';
import Container from 'typedi';
import { authCookie } from '../jest-helpers/cookie';
import favFoldersMockedService from '../jest-helpers/spy-services/favFolders';
import favorisMockedService from '../jest-helpers/spy-services/favoris';

describe('DELETE favFolders/remove/:id', () => {
  const deleteFavFolderRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).delete(`/api/favFolders/remove/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  const FavorisService = Container.get(FavorisServiceFile);

  let deleteFavorisFromFolder: FavorisServicesJest['deleteFavorisFromFolder'];
  let deleteFavFolder: FavFolderServicesJest['deleteFavFolder'];

  beforeEach(() => {
    deleteFavFolder = favFoldersMockedService().deleteFavFolder;
    deleteFavorisFromFolder = favorisMockedService().deleteFavorisFromFolder;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await deleteFavFolderRequest('1');

    expect(response.status).toBe(999);
    expect(deleteFavFolder).not.toHaveBeenCalled();
    expect(deleteFavorisFromFolder).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await deleteFavFolderRequest('azerty', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(deleteFavFolder).not.toHaveBeenCalled();
    expect(deleteFavorisFromFolder).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: params.id: Expected number, received nan');
  });

  //; delete a favFolder with incorrect userId
  it('delete a favFolder with incorrect userId => status 201 / false ', async () => {
    const response = await deleteFavFolderRequest('1', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteFavFolder).toHaveBeenNthCalledWith(1, 1, 5);
    expect(deleteFavorisFromFolder).not.toHaveBeenCalled();

    expect(response.text).toBe('false');
  });

  //; delete a favFolder
  it('delete a favFolder => status 204 / true ', async () => {
    const response = await deleteFavFolderRequest('3', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    const favorisInFolder = await FavorisService.getFavorisFromFolder(10, 1, 3);
    expect(response.status).toBe(204);
    expect(favorisInFolder).toHaveProperty('results');
    expect(favorisInFolder).toHaveProperty('total');
    expect(favorisInFolder.total).toBe(0);
    expect(favorisInFolder.results?.length).toBe(0);
    expect(deleteFavFolder).toHaveBeenNthCalledWith(1, 3, 1);
    expect(deleteFavorisFromFolder).toHaveBeenNthCalledWith(1, 3);
  });

  //; delete a non-existing favFolder
  it('delete a non-existing favFolder => status 201 / false ', async () => {
    const response = await deleteFavFolderRequest('57', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteFavFolder).toHaveBeenNthCalledWith(1, 57, 1);
    expect(deleteFavorisFromFolder).not.toHaveBeenCalled();

    expect(response.text).toBe('false');
  });
});
