import type { SearchServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import searchMockedService from '../jest-helpers/spy-services/searches';

describe('POST searches/new', () => {
  const createSearchRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).post('/api/searches/new').set('Cookie', authCookieValue);
    }
    return request(global.app).post('/api/searches/new');
  };

  let getTotalCount: SearchServicesJest['getTotalSearchCount'];
  let create: SearchServicesJest['create'];

  beforeEach(() => {
    create = searchMockedService().create;
    getTotalCount = searchMockedService().getTotalSearchCount;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await createSearchRequest();

    expect(response.status).toBe(999);
    expect(create).not.toHaveBeenCalled();
    expect(getTotalCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With values => 422 error (Invalid type keys)', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      society: false,
      isCv: 154,
    });

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
    expect(getTotalCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: body.searchFolderId: Required number - body.searchQueries: Required string - body.name: Required string - body.society: Expected string, received boolean - body.isCv: Expected boolean, received number',
    );
  });

  //; create a new searches
  it('create a new searches => status 201 / searches ', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"devops","sector":"cyber","skill":"defense","time":true}',
      searchFolderId: 4,
      name: 'future',
      society: 'apple',
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        searchQueries: '{"platform":["LinkedIn"],"fn":"devops","sector":"cyber","skill":"defense","time":true}',
        name: 'future',
        society: 'apple',
        searchFolderId: 4,
      },
      1,
    );
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('4');
  });

  //; create a searches with wrong folderId
  it('create a searches with wrong folderId => 422 error ( Echec de la connexion avec la base de donnees )', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"devops","sector":"cyber","skill":"defense","time":true}',
      searchFolderId: 57,
      name: 'future',
      society: 'apple',
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        searchQueries: '{"platform":["LinkedIn"],"fn":"devops","sector":"cyber","skill":"defense","time":true}',
        name: 'future',
        society: 'apple',
        searchFolderId: 57,
      },
      1,
    );

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("Le dossier assigné a la recherche n'existe pas.");
  });

  //; create same new searches
  it('create same new searches => status 201 / false ', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"agriculteur","sector":"agriculture","skill":"patate","time":true}',
      searchFolderId: 3,
      name: 'culture',
      society: 'lamborder',
    });

    expect(response.status).toBe(201);
    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        searchQueries: '{"platform":["LinkedIn"],"fn":"agriculteur","sector":"agriculture","skill":"patate","time":true}',
        searchFolderId: 3,
        name: 'culture',
        society: 'lamborder',
      },
      1,
    );

    expect(response.body).toBe(false);
  });

  //; re-create a deleted favoris
  it('re-create a deleted folder => status 201 / favoris', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"développeur","sector":"informatique","skill":"javascript","time":true}',
      searchFolderId: 3,
      name: 'technologies',
      society: 'openAI',
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        searchQueries: '{"platform":["LinkedIn"],"fn":"développeur","sector":"informatique","skill":"javascript","time":true}',
        name: 'technologies',
        society: 'openAI',
        searchFolderId: 3,
      },
      1,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('1');
  });

  //; exceed max limit of favoris
  it('exceed max limit of favoris => 605 error ( Vous avez atteint la limite de favoris enregistrés avec votre abonnement ) ', async () => {
    const response = await createSearchRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"devops","sector":"cyber","skill":"defense","time":true}',
      searchFolderId: 4,
      name: 'future',
      society: 'apple',
    });

    expect(response.status).toBe(605);
    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).not.toHaveBeenCalled();

    expect(response.body.error).toBe('Vous avez atteint la limite de favoris enregistrés avec votre abonnement FREE.');
  });
});
