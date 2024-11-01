import type { FavFolderServicesJest, FavorisServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favFoldersMockedService from '../jest-helpers/spy-services/favFolders';
import favorisMockedService from '../jest-helpers/spy-services/favoris';

describe('GET favoris/get/:favFolderName', () => {
  const getFavInFolderRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/favoris/get/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let getFavorisFromFolder: FavorisServicesJest['getFavorisFromFolder'];
  let search: FavFolderServicesJest['search'];

  beforeEach(() => {
    getFavorisFromFolder = favorisMockedService().getFavorisFromFolder;
    search = favFoldersMockedService().search;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getFavInFolderRequest('folder');

    expect(response.status).toBe(999);
    expect(getFavorisFromFolder).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; get favorites in folder with incorrect userId
  it('get favorites in folder with incorrect userId => status 200 / false ', async () => {
    const response = await getFavInFolderRequest('folderC', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' });
    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderC', 5);
    expect(getFavorisFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });

  //; get favorites in folder
  it('get a favorites => status 200 / favoris ', async () => {
    const response = await getFavInFolderRequest('folderC', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderC', 1);
    expect(getFavorisFromFolder).toHaveBeenNthCalledWith(1, 10, 1, '3');
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(1);
    expect(response.body.results[0]).toHaveProperty('id');
    expect(response.body.results[0]).toHaveProperty('link');
    expect(response.body.results[0]).toHaveProperty('favFolderId');
    expect(response.body.results[0]).toHaveProperty('userId');
    expect(response.body.results[0].id).toBe('2');
    expect(response.body.results[0].link).toBe('https://www.linkedin.com/in');
    expect(response.body.results[0].favFolderId).toBe(3);
    expect(response.body.results[0].userId).toBe(1);
  });

  //; get favorites from non-existing folder
  it('get favorites from non-existing folder => status 200 / false ', async () => {
    const response = await getFavInFolderRequest('folderCtPasExist', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderCtPasExist', 1);
    expect(getFavorisFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });
});
