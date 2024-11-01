import { FavorisServicesJest, ScoresServicesJest, SearchServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favorisMockedService from '../jest-helpers/spy-services/favoris';
import scoresMockedService from '../jest-helpers/spy-services/scores';
import searchMockedService from '../jest-helpers/spy-services/searches';

describe('GET scores/get/:keys', () => {
  const getKeysScoresRequest = (params: string, auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/scores/get/${params}`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let getTotalFavorisCount: FavorisServicesJest['getTotalFavorisCount'];
  let getTotalSearchCount: SearchServicesJest['getTotalSearchCount'];
  let getTotalMonthValues: ScoresServicesJest['getTotalMonthValues'];

  beforeEach(() => {
    getTotalMonthValues = scoresMockedService().getTotalMonthValues;
    getTotalFavorisCount = favorisMockedService().getTotalFavorisCount;
    getTotalSearchCount = searchMockedService().getTotalSearchCount;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getKeysScoresRequest('searches');

    expect(response.status).toBe(999);
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(getTotalFavorisCount).not.toHaveBeenCalled();
    expect(getTotalSearchCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await getKeysScoresRequest('test', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(422);
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(getTotalFavorisCount).not.toHaveBeenCalled();
    expect(getTotalSearchCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      "Invalid type for keys: params.keys.0: Invalid enum value. Expected 'searches' | 'mails' | 'favorisSave' | 'searchSave', received 'test'",
    );
  });

  //; get searches score
  it('get searches score => status 200 / { isCurrentData, score } ', async () => {
    const response = await getKeysScoresRequest('["searches"]', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['searches']);
    expect(getTotalFavorisCount).not.toHaveBeenCalled();
    expect(getTotalSearchCount).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty('searches');
    expect(response.body.searches).toHaveProperty('score');
    expect(response.body.searches).toHaveProperty('total');
    expect(response.body.searches.total).toBe(10);
    expect(response.body.searches.score).toBe(5);
  });

  //; get multiple searches score
  it('get multiple searches score => status 200 / { isCurrentData, score } ', async () => {
    const response = await getKeysScoresRequest('["searches", "favorisSave"]', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(200);
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['searches']);
    expect(getTotalFavorisCount).toHaveBeenNthCalledWith(1, 1);
    expect(getTotalSearchCount).not.toHaveBeenCalled();
    expect(response.body).toHaveProperty('searches');
    expect(response.body).toHaveProperty('favorisSave');
    expect(response.body.searches).toHaveProperty('score');
    expect(response.body.searches).toHaveProperty('total');
    expect(response.body.searches.total).toBe(10);
    expect(response.body.searches.score).toBe(5);
    expect(response.body.favorisSave).toHaveProperty('score');
    expect(response.body.favorisSave).toHaveProperty('total');
    expect(response.body.favorisSave.total).toBe(10);
    expect(response.body.favorisSave.score).toBe(1);
  });
});
