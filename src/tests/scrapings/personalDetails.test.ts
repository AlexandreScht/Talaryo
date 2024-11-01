import type { APIServicesJest, MemoryCacheJest, ScoresServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import MongoServiceFile from '@/services/mongo';
import request from 'supertest';
import Container from 'typedi';
import { authCookie } from '../jest-helpers/cookie';
import memoryCacheMocked from '../jest-helpers/spy-libs/memoryMock';
import apiMockedService from '../jest-helpers/spy-services/api';
import scoresMockedService from '../jest-helpers/spy-services/scores';

describe('GET scrapping/personal-data', () => {
  const scrapePersonalDataRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/scrapping/personal-data').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/scrapping/personal-data');
  };

  const MongoService = Container.get(MongoServiceFile);

  let getTotalMonthValues: ScoresServicesJest['getTotalMonthValues'];
  let improveScore: ScoresServicesJest['improveScore'];
  let FetchMailRequestId: APIServicesJest['FetchMailRequestId'];
  let SendSignalHireRequest: APIServicesJest['SendSignalHireRequest'];
  let FetchMailData: APIServicesJest['FetchMailData'];
  let personalData: jest.SpyInstance<
    Promise<{ color: any; email: any; phone: any }[] | { email: string; phone: string | string[]; color: number }>,
    [searchFirstName: string, searchLastName: string],
    any
  >;

  let setMemory: MemoryCacheJest['setMemory'];

  beforeEach(() => {
    setMemory = memoryCacheMocked().setMemory;

    getTotalMonthValues = scoresMockedService().getTotalMonthValues;
    improveScore = scoresMockedService().improveScore;

    FetchMailRequestId = apiMockedService().FetchMailRequestId;
    SendSignalHireRequest = apiMockedService().SendSignalHireRequest;
    FetchMailData = apiMockedService().FetchMailData;

    personalData = jest.spyOn(MongoService, 'personalData');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await scrapePersonalDataRequest();

    expect(response.status).toBe(999);
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(FetchMailRequestId).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(FetchMailData).not.toHaveBeenCalled();
    expect(personalData).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 8415,
      lastName: 'ddd',
      link: { tt: 't' },
    });

    expect(response.status).toBe(422);
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(FetchMailRequestId).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(FetchMailData).not.toHaveBeenCalled();
    expect(personalData).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: query.company: Le type attendu est un string - query.link: Le type attendu est un string',
    );
  });

  //; limit exceed
  it("limit exceed => 605 error (Limite mensuelle de recherche d'emails atteinte avec votre abonnement)", async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 10 });
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
    });

    expect(response.status).toBe(605);
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(improveScore).not.toHaveBeenCalled();
    expect(FetchMailRequestId).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(FetchMailData).not.toHaveBeenCalled();
    expect(personalData).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Limite mensuelle de recherche d'emails atteinte avec votre abonnement FREE.");
  });

  //; Free accounts without results
  it('Free accounts without results => 204 status', async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 5 });
    FetchMailRequestId.mockResolvedValue('fetchId');
    FetchMailData.mockResolvedValue(undefined);
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
    });
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(FetchMailData).toHaveBeenCalledWith('fetchId');
    expect(FetchMailData).toHaveBeenCalledTimes(10);
    expect(FetchMailRequestId).toHaveBeenNthCalledWith(1, {
      first_name: 'alexandre',
      last_name: 'schecht'.toLocaleUpperCase(),
      company: 'Google',
    });
    expect(personalData).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; Pro/business accounts without results ( no linkedIn candidate )
  it('Pro/business accounts without results ( no linkedIn candidate ) => 204 status', async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 5 });
    FetchMailRequestId.mockResolvedValue('fetchId');
    FetchMailData.mockResolvedValue(undefined);
    personalData.mockResolvedValue(undefined);
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
    });
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(FetchMailData).toHaveBeenCalledWith('fetchId');
    expect(FetchMailData).toHaveBeenCalledTimes(10);
    expect(FetchMailRequestId).toHaveBeenNthCalledWith(1, {
      first_name: 'alexandre',
      last_name: 'schecht'.toLocaleUpperCase(),
      company: 'Google',
    });
    expect(personalData).toHaveBeenNthCalledWith(1, 'alexandre', 'schecht');
    expect(improveScore).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; Free accounts with results
  it('Free accounts with results => 200 status / personal data', async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 5 });
    FetchMailRequestId.mockResolvedValue('fetchId');
    FetchMailData.mockResolvedValue([{ email: 'alexandreschecht@gmail.com' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
    });
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(FetchMailData).toHaveBeenCalledWith('fetchId');
    expect(FetchMailData).toHaveBeenCalledTimes(4);
    expect(FetchMailRequestId).toHaveBeenNthCalledWith(1, {
      first_name: 'alexandre',
      last_name: 'schecht'.toLocaleUpperCase(),
      company: 'Google',
    });
    expect(personalData).not.toHaveBeenCalled();
    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails'], 1, 1);
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      res: { email: 'alexandreschecht@gmail.com' },
    });
  });

  //; Pro/business accounts with results
  it('Pro/business accounts with results => 200 status / personal data', async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 5 });
    FetchMailRequestId.mockResolvedValue('fetchId');
    FetchMailData.mockResolvedValue([{ email: 'alexandreschecht@gmail.com' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    personalData.mockResolvedValue([{ email: 'alex.v@gmail.com', color: 1, phone: undefined }]);

    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
    });
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(FetchMailData).toHaveBeenCalledWith('fetchId');
    expect(FetchMailData).toHaveBeenCalledTimes(4);
    expect(FetchMailRequestId).toHaveBeenNthCalledWith(1, {
      first_name: 'alexandre',
      last_name: 'schecht'.toLocaleUpperCase(),
      company: 'Google',
    });
    expect(personalData).toHaveBeenNthCalledWith(1, 'alexandre', 'schecht');
    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails'], 1, 1);
    expect(SendSignalHireRequest).not.toHaveBeenCalled();
    expect(setMemory).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      res: { email: 'alexandreschecht@gmail.com', json: [{ email: 'alex.v@gmail.com', color: 1, phone: undefined }] },
    });
  });

  //; Pro/business accounts without results ( linkedIn candidate )
  it('Pro/business accounts without results ( linkedIn candidate ) => 206 status', async () => {
    getTotalMonthValues.mockResolvedValue({ mails: 5 });
    FetchMailRequestId.mockResolvedValue('fetchId');
    FetchMailData.mockResolvedValue(undefined);
    personalData.mockResolvedValue(undefined);
    SendSignalHireRequest.mockResolvedValue('signalHireId');
    const response = await scrapePersonalDataRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' }).query({
      firstName: 'alexandre',
      lastName: 'schecht',
      company: 'Google',
      link: 'http://linkedIn.com',
    });
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['mails']);
    expect(FetchMailData).toHaveBeenCalledWith('fetchId');
    expect(FetchMailData).toHaveBeenCalledTimes(10);
    expect(FetchMailRequestId).toHaveBeenNthCalledWith(1, {
      first_name: 'alexandre',
      last_name: 'schecht'.toLocaleUpperCase(),
      company: 'Google',
    });
    expect(personalData).toHaveBeenNthCalledWith(1, 'alexandre', 'schecht');
    expect(improveScore).not.toHaveBeenCalled();
    expect(SendSignalHireRequest).toHaveBeenNthCalledWith(1, 'http://linkedIn.com', expect.stringMatching(/^http.*\/api$/));
    expect(setMemory).toHaveBeenNthCalledWith(1, 'signalHire.signalHireId', { userId: 1, link: 'http://linkedIn.com' });
    expect(response.status).toBe(206);
    expect(response.body).toEqual({});
  });
});
