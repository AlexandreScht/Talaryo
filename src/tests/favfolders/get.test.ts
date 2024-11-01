import type { FavFolderServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favFoldersMockedService from '../jest-helpers/spy-services/favFolders';

describe('GET favFolders/get-folder/:name', () => {
  const getFavFolderRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/favFolders/get-folder/${params}`);
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
    const response = await getFavFolderRequest('1');

    expect(response.status).toBe(999);
    expect(getContent).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => status 200', async () => {
    const response = await getFavFolderRequest('select * from users', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'select * from users', page: 1 });

    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results?.length).toBe(0);
    expect(response.body.total).toBe(0);
  });

  //; With specials values
  it('With specials values => status 200', async () => {
    const response = await getFavFolderRequest('maçillteuré', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'maçillteuré', page: 1 });
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results[0]).toHaveProperty('id');
    expect(response.body.results[0]).toHaveProperty('name');
    expect(response.body.results[0]).toHaveProperty('itemsCount');
    expect(response.body.results[0].id).toBe('2');
    expect(response.body.results[0].name).toBe('maçillteuré');
    expect(response.body.results[0].itemsCount).toBe('0');
    expect(response.body.total).toBe(1);
  });

  //; To Get a deleted folders
  it('To Get a deleted folders => status 200', async () => {
    const response = await getFavFolderRequest('folderB', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getContent).toHaveBeenNthCalledWith(1, 1, { limit: 10, name: 'folderB', page: 1 });
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.results?.length).toBe(0);
    expect(response.body.total).toBe(0);
  });
});
