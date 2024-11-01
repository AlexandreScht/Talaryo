import { SearchFolderServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import searchFolderMockedService from '../jest-helpers/spy-services/searchFolders';
describe('POST searchFolder/new', () => {
  const createSearchFolderRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).post('/api/searchFolder/new').set('Cookie', authCookieValue);
    }
    return request(global.app).post('/api/searchFolder/new');
  };

  let create: SearchFolderServicesJest['create'];
  beforeEach(() => {
    create = searchFolderMockedService().create;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await createSearchFolderRequest();

    expect(response.status).toBe(999);
    expect(create).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await createSearchFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      value: 123,
    });

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: body.name: Le type attendu est un string');
  });

  //; create a new folder
  it('create a new folder => status 201 / folder ', async () => {
    const response = await createSearchFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      name: 'NewFolder',
    });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenNthCalledWith(1, 'NewFolder', 1);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('5');
    expect(response.body).toHaveProperty('name');
    expect(response.body.name).toBe('NewFolder');
    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBe(1);
  });

  //; create same new folder
  it('create same new folder => status 201 / false ', async () => {
    const response = await createSearchFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      name: 'NewFolder',
    });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenNthCalledWith(1, 'NewFolder', 1);

    expect(response.body).toBe(false);
  });

  //; re-create a deleted folder
  it('re-create a deleted folder => status 201 / { meta: { results, total }}', async () => {
    const response = await createSearchFolderRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      name: 'folderB',
    });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenNthCalledWith(1, 'folderB', 1);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('1');
    expect(response.body).toHaveProperty('name');
    expect(response.body.name).toBe('folderB');
    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBe(1);
  });
});
