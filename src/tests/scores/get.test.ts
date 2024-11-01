import { ScoresServicesJest } from '@/interfaces/jest';
import { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import scoresMockedService from '../jest-helpers/spy-services/scores';

describe('GET scores/get', () => {
  const getScoresRequest = (auth?: TokenUser) => {
    const agent = request(global.app).get(`/api/scores/get`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  let getUserCurrentScores: ScoresServicesJest['getUserCurrentScores'];
  let getUserRangeScores: ScoresServicesJest['getUserRangeScores'];

  beforeEach(() => {
    getUserCurrentScores = scoresMockedService().getUserCurrentScores;
    getUserRangeScores = scoresMockedService().getUserRangeScores;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await getScoresRequest();

    expect(response.status).toBe(999);
    expect(getUserCurrentScores).not.toHaveBeenCalled();
    expect(getUserRangeScores).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await getScoresRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      startDate: '22/10/2024',
      endDate: '25/10/2024',
    });

    expect(response.status).toBe(422);
    expect(getUserCurrentScores).not.toHaveBeenCalled();
    expect(getUserRangeScores).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: query.startDate: La date doit être une chaîne ISO valide. - query.endDate: La date doit être une chaîne ISO valide.',
    );
  });

  //; get range month scores
  it('get range month scores => status 200 / { isCurrentData, score } ', async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const response = await getScoresRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    });

    const startDateValue = new Date(firstDayOfMonth.toISOString());
    const endDateValue = new Date(lastDayOfMonth.toISOString());

    startDateValue.setHours(0, 0, 0, 0);
    endDateValue.setHours(0, 0, 0, 0);
    expect(getUserCurrentScores).not.toHaveBeenCalled();
    expect(getUserRangeScores).toHaveBeenNthCalledWith(1, startDateValue, endDateValue, 1);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isCurrentData');
    expect(response.body).toHaveProperty('score');
    expect(response.body.isCurrentData).toBe(false);
    expect(response.body.score?.length).toBe(1);
    expect(response.body.score[0]).toHaveProperty('searches');
    expect(response.body.score[0].searches).toBe(0);
    expect(response.body.score[0]).toHaveProperty('profils');
    expect(response.body.score[0].profils).toBe(5);
  });

  //; get current month scores
  it('get current month scores => status 200 / { isCurrentData, score } ', async () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const response = await getScoresRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      startDate: currentDate.toISOString(),
      endDate: currentDate.toISOString(),
    });

    expect(getUserRangeScores).not.toHaveBeenCalled();
    expect(getUserCurrentScores).toHaveBeenNthCalledWith(1, 1);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('isCurrentData');
    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.isCurrentData).toBe(true);
    expect(response.body.score?.length).toBe(1);
    expect(response.body.score[0]).toHaveProperty('searches');
    expect(response.body.score[0].searches).toBe(5);
    expect(response.body.meta).toHaveProperty('searches');
    expect(response.body.meta).toHaveProperty('profiles');
    expect(response.body.meta.searches).toBe(0);
    expect(response.body.meta.profiles).toBe(5);
  });
});
