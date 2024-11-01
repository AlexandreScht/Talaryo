import type { SearchFolderServicesJest, SearchServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import searchMockedService from '../jest-helpers/spy-services/searches';
import searchFolderMockedService from '../jest-helpers/spy-services/searchFolders';

describe('GET searches/get/:searchFolderName', () => {
  const getSearchesInFolderRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/searches/get/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let getSearchesFromFolder: SearchServicesJest['getSearchesFromFolder'];
  let search: SearchFolderServicesJest['search'];

  beforeEach(() => {
    getSearchesFromFolder = searchMockedService().getSearchesFromFolder;
    search = searchFolderMockedService().search;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getSearchesInFolderRequest('folder');

    expect(response.status).toBe(999);
    expect(getSearchesFromFolder).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; get searches in folder with incorrect userId
  it('get searches in folder with incorrect userId => status 200 / false ', async () => {
    const response = await getSearchesInFolderRequest('folderC', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' });
    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderC', 5);
    expect(getSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });

  //; get searches in folder
  it('get a searches => status 200 / favoris ', async () => {
    const response = await getSearchesInFolderRequest('folderC', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderC', 1);
    expect(getSearchesFromFolder).toHaveBeenNthCalledWith(1, 10, 1, '3');
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(2);

    expect(response.body.results[0]).toHaveProperty('id');
    expect(response.body.results[0]).toHaveProperty('searchQueries');
    expect(response.body.results[0]).toHaveProperty('searchFolderId');
    expect(response.body.results[0]).toHaveProperty('userId');
    expect(response.body.results[0].id).toBe('3');
    expect(response.body.results[0].searchQueries).toBe(
      '{"platform":["LinkedIn"],"fn":"vidaeo","sector":"agriculture","skill":"patate","time":true}',
    );
    expect(response.body.results[0].searchFolderId).toBe(3);
    expect(response.body.results[0].userId).toBe(1);
  });

  //; get searches from non-existing folder
  it('get searches from non-existing folder => status 200 / false ', async () => {
    const response = await getSearchesInFolderRequest('folderCtPasExist', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(200);
    expect(search).toHaveBeenNthCalledWith(1, 'folderCtPasExist', 1);
    expect(getSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });
});
