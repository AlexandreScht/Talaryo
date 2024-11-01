import { SearchServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import searchMockedService from '../jest-helpers/spy-services/searches';

describe('GET searches/get', () => {
  const getSearchesRequest = (auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/searches/get`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let get: SearchServicesJest['get'];

  beforeEach(() => {
    get = searchMockedService().get;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getSearchesRequest();

    expect(response.status).toBe(999);
    expect(get).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await getSearchesRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      isCv: 25,
      limit: 0,
      page: 'azerty',
    });

    expect(response.status).toBe(422);
    expect(get).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: query.isCv: Expected boolean, received string - query.limit: Number must be greater than or equal to 1 - query.page: Expected number, received nan',
    );
  });

  //; get searches with incorrect userId
  it('get searches with incorrect userId => status 200 / false ', async () => {
    const response = await getSearchesRequest({ refreshToken: 'refreshToken', sessionId: 5, sessionRole: 'free' }).query({ limit: 3 });
    expect(response.status).toBe(200);
    expect(get).toHaveBeenNthCalledWith(1, { isCv: false, limit: 3, page: 1 }, 5);
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(0);
    expect(response.body.results?.length).toBe(0);
  });

  //; get searches
  it('get searches => status 200 / favoris ', async () => {
    const response = await getSearchesRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(get).toHaveBeenNthCalledWith(1, { isCv: false, limit: 10, page: 1 }, 1);

    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(1);
    expect(response.body.results[0]).toHaveProperty('id');
    expect(response.body.results[0]).toHaveProperty('searchQueries');
    expect(response.body.results[0]).toHaveProperty('searchFolderId');
    expect(response.body.results[0]).toHaveProperty('userId');
    expect(response.body.results[0].id).toBe('2');
    expect(response.body.results[0].searchQueries).toBe(
      '{"platform":["LinkedIn"],"fn":"agriculteur","sector":"agriculture","skill":"patate","time":true}',
    );
    expect(response.body.results[0].searchFolderId).toBe(3);
    expect(response.body.results[0].userId).toBe(1);
  });

  //; get searches in outside page range
  it('get searches in outside page range => status 200 / false ', async () => {
    const response = await getSearchesRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      page: 10,
      isCv: true,
      limit: 5,
    });

    expect(response.status).toBe(200);
    expect(get).toHaveBeenNthCalledWith(1, { isCv: true, limit: 5, page: 10 }, 1);
    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBe(1);
    expect(response.body.results?.length).toBe(0);
  });
});
