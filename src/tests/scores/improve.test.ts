import type { ScoresServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import ScoreServiceFile from '@/services/scores';
import request from 'supertest';
import Container from 'typedi';
import { authCookie } from '../jest-helpers/cookie';
import scoresMockedService from '../jest-helpers/spy-services/scores';

describe('PATCH scores/improve', () => {
  const improveScoreRequest = (auth?: TokenUser) => {
    const agent = request(global.app).patch(`/api/scores/improve`);
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  const ScoreService = Container.get(ScoreServiceFile);

  let improveScore: ScoresServicesJest['improveScore'];
  beforeEach(() => {
    improveScore = scoresMockedService().improveScore;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await improveScoreRequest();

    expect(response.status).toBe(999);
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await improveScoreRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      column: 'session',
      count: true,
    });

    expect(response.status).toBe(422);
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: body.column: Expected array, received string - body.count: Expected number, received boolean',
    );
  });

  //; improve scores
  it('improve scores => status 204 ', async () => {
    const response = await improveScoreRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      column: ['mails'],
      count: 5,
    });
    const scores = await ScoreService.getTotalMonthValues(1, ['mails', 'searches']);

    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails'], 5, 1);
    expect(scores).toHaveProperty('mails');
    expect(scores).toHaveProperty('searches');
    expect(scores.mails).toBe(5);
    expect(scores.searches).toBe(5);
    expect(response.status).toBe(204);
  });

  //; improve existing scores
  it('improve existing scores => status 204 ', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    jest.spyOn(ScoreServiceFile.prototype, 'currentDate', 'get').mockReturnValue(new Date(yesterday));
    const response = await improveScoreRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      column: ['mails'],
      count: 5,
    });
    const scores = await ScoreService.getTotalMonthValues(1, ['mails', 'searches']);

    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails'], 5, 1);
    expect(scores).toHaveProperty('mails');
    expect(scores).toHaveProperty('searches');
    expect(scores.mails).toBe(10);
    expect(scores.searches).toBe(5);
    expect(response.status).toBe(204);
  });

  //; improve multiple scores
  it('improve multiple scores => status 204 ', async () => {
    const response = await improveScoreRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      column: ['mails', 'searches'],
      count: 5,
    });
    const scores = await ScoreService.getTotalMonthValues(1, ['mails', 'searches']);

    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails', 'searches'], 5, 1);
    expect(scores).toHaveProperty('mails');
    expect(scores).toHaveProperty('searches');
    expect(scores.mails).toBe(15);
    expect(scores.searches).toBe(10);
    expect(response.status).toBe(204);
  });
});
