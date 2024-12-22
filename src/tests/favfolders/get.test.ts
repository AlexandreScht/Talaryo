import type { FavFolderServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favFoldersMockedService from '../jest-helpers/spy-services/favFolders';

describe('GET favFolders/get-folder/:name', () => {
  const getFavFolderRequest = (auth?: TokenUser) => {
    const agent = request(global.app).get('/api/favFolders/get');
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let getContent: FavFolderServicesJest['getContent'];
  beforeEach(() => {
    getContent = favFoldersMockedService().getContent;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getFavFolderRequest();

    expect(response.status).toBe(999);
    expect(getContent).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => status 200', async () => {
    const response = await getFavFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      name: 'SELECT * FROM users',
    });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'SELECT * FROM users', page: 1 });

    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results?.length).toBe(0);
    expect(response.body.total).toBe(0);
  });

  //; With specials values
  it('With specials values => status 200', async () => {
    const response = await getFavFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      name: 'maçillteuré',
    });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'maçillteuré', page: 1 });
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results).toEqual([{ id: '2', name: 'maçillteuré', itemsCount: '0' }]);
    expect(response.body.total).toBe(1);
  });

  //; get All folders
  it('get All folders => status 200', async () => {
    const response = await getFavFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: undefined, page: 1 });
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results).toEqual([
      { id: '2', name: 'maçillteuré', itemsCount: '0' },
      { id: '3', name: 'folderC', itemsCount: '1' },
      { id: '4', name: 'folderD', itemsCount: '0' },
    ]);
    expect(response.body.total).toBe(3);
  });

  //; To Get a deleted folders
  it('To Get a deleted folders => status 200', async () => {
    const response = await getFavFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      name: 'folderB',
    });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'folderB', page: 1 });
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results?.length).toBe(0);
    expect(response.body.total).toBe(0);
  });
});
