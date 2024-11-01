import type { SearchFolderServicesJest, SearchServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import SearchesServiceFile from '@/services/searches';
import request from 'supertest';
import Container from 'typedi';
import { authCookie } from '../jest-helpers/cookie';
import searchFolderMockedService from '../jest-helpers/spy-services/searchFolders';
import searchMockedService from '../jest-helpers/spy-services/searches';

describe('DELETE searchFolder/remove/:id', () => {
  const deleteSearchFolderRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).delete(`/api/searchFolder/remove/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  const SearchesService = Container.get(SearchesServiceFile);

  let deleteSearchFolder: SearchFolderServicesJest['deleteSearchFolder'];
  let deleteSearchesFromFolder: SearchServicesJest['deleteSearchesFromFolder'];
  beforeEach(() => {
    deleteSearchFolder = searchFolderMockedService().deleteSearchFolder;
    deleteSearchesFromFolder = searchMockedService().deleteSearchesFromFolder;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await deleteSearchFolderRequest('1');

    expect(response.status).toBe(999);
    expect(deleteSearchFolder).not.toHaveBeenCalled();
    expect(deleteSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await deleteSearchFolderRequest('azerty', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(deleteSearchFolder).not.toHaveBeenCalled();
    expect(deleteSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: params.id: Expected number, received nan');
  });

  //; delete a searchFolder with incorrect userId
  it('delete a searchFolder with incorrect userId => status 201 / false ', async () => {
    const response = await deleteSearchFolderRequest('1', { refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteSearchFolder).toHaveBeenNthCalledWith(1, 1, 5);
    expect(deleteSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });

  //; delete a searchFolder
  it('delete a searchFolder => status 204 / true ', async () => {
    const response = await deleteSearchFolderRequest('3', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    const searchesInFolder = await SearchesService.getSearchesFromFolder(10, 1, 3);
    expect(response.status).toBe(204);
    expect(searchesInFolder).toHaveProperty('results');
    expect(searchesInFolder).toHaveProperty('total');
    expect(searchesInFolder.total).toBe(0);
    expect(searchesInFolder.results?.length).toBe(0);
    expect(deleteSearchFolder).toHaveBeenNthCalledWith(1, 3, 1);
    expect(deleteSearchesFromFolder).toHaveBeenNthCalledWith(1, 3);
  });

  //; delete a non-existing searchFolder
  it('delete a non-existing searchFolder => status 201 / false ', async () => {
    const response = await deleteSearchFolderRequest('57', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });
    expect(response.status).toBe(201);
    expect(deleteSearchFolder).toHaveBeenNthCalledWith(1, 57, 1);
    expect(deleteSearchesFromFolder).not.toHaveBeenCalled();
    expect(response.text).toBe('false');
  });
});
