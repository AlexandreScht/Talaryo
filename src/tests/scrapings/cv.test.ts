import type {
  FavorisServicesJest,
  MemoryCacheJest,
  PuppeteerJest,
  ScoresServicesJest,
  ScraperServicesJest,
  SocketManagerJest,
  StreamManagerJest,
} from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import { blankPage, cvForm, cvUrl, dataMultiplePages, dataPage, ExpectedCvPuppeteer } from '../jest-helpers/scrapping_cv';
import memoryCacheMocked from '../jest-helpers/spy-libs/memoryMock';
import puppeteerMocked, { mockBrowser, mockPage } from '../jest-helpers/spy-libs/puppeteer';
import RedisInstanceMocked from '../jest-helpers/spy-libs/redisMock';
import SocketManagerMocked from '../jest-helpers/spy-libs/socketMock';
import streamManagerMocked from '../jest-helpers/spy-libs/streamManagerMock';
import axiosMocked from '../jest-helpers/spy-modules/axios';
import favorisMockedService from '../jest-helpers/spy-services/favoris';
import scoresMockedService from '../jest-helpers/spy-services/scores';
import scraperMockedService from '../jest-helpers/spy-services/scraper';

describe('GET scrapping/cv', () => {
  const scrapeCVRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/scrapping/cv').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/scrapping/cv');
  };
  //?redis
  let redisMock: ReturnType<typeof RedisInstanceMocked>;

  //? services
  let scrapeCV: ScraperServicesJest['scrapeCV'];
  let userCandidateFavoris: FavorisServicesJest['userCandidateFavoris'];
  let improveScore: ScoresServicesJest['improveScore'];
  let decrementCv: ScoresServicesJest['decrementCv'];
  let getTotalMonthValues: ScoresServicesJest['getTotalMonthValues'];

  //? stream
  const userId = 1;
  let newStream: StreamManagerJest['newStream'];
  let getStreamUser: StreamManagerJest['getStreamUser'];
  let checkStream: StreamManagerJest['checkStream'];
  let process: StreamManagerJest['process'];
  let execute: StreamManagerJest['execute'];
  let streamStrategies: StreamManagerJest['streamStrategies'];

  //? socket
  let socketMocked: SocketManagerJest;

  //? memoryCache
  let setMemory: MemoryCacheJest['setMemory'];
  let getMemory: MemoryCacheJest['getMemory'];
  let delMemory: MemoryCacheJest['delMemory'];
  let memoryData: MemoryCacheJest['memoryData'];

  //? puppeteer
  let checkPuppeteer: PuppeteerJest['check'];
  let scrapePage: PuppeteerJest['scrapePage'];
  let configurePage: PuppeteerJest['configurePage'];
  let openSpy: PuppeteerJest['open'];
  let scrapperCV: PuppeteerJest['scrapperCv'];
  let closeBrowser: PuppeteerJest['close'];
  let getNumber: PuppeteerJest['getNumber'];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    //? axios
    axiosMocked().get.mockResolvedValue({ status: 400, data: null });
    //? redis
    redisMock = RedisInstanceMocked();

    //? memory
    setMemory = memoryCacheMocked().setMemory;
    getMemory = memoryCacheMocked().getMemory;
    delMemory = memoryCacheMocked().delMemory;
    memoryData = memoryCacheMocked().memoryData;

    //? services
    scrapeCV = scraperMockedService().scrapeCV;
    userCandidateFavoris = favorisMockedService().userCandidateFavoris;
    improveScore = scoresMockedService().improveScore;
    decrementCv = scoresMockedService().decrementCv;
    getTotalMonthValues = scoresMockedService().getTotalMonthValues;

    //?socket
    socketMocked = SocketManagerMocked();

    //? stream
    getStreamUser = streamManagerMocked(userId).getStreamUser;
    checkStream = streamManagerMocked(userId).checkStream;
    process = streamManagerMocked(userId).process;
    execute = streamManagerMocked(userId).execute;
    streamStrategies = streamManagerMocked(userId).streamStrategies;
    newStream = streamManagerMocked(userId).newStream;

    //? puppeteer
    checkPuppeteer = puppeteerMocked().check;
    scrapePage = puppeteerMocked().scrapePage;
    configurePage = puppeteerMocked().configurePage;
    openSpy = puppeteerMocked().open;
    scrapperCV = puppeteerMocked().scrapperCv;
    closeBrowser = puppeteerMocked().close;
    getNumber = puppeteerMocked().getNumber;
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await scrapeCVRequest();

    expect(response.status).toBe(999);
    expect(scrapeCV).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; scrape cv with free account
  it("scrape cv with free account => 605 error ( Veuillez souscrire à une formule d'abonnement supérieure ) ", async () => {
    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      fn: 'developer web',
      sector: 'informatique',
    });
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(scrapeCV).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(605);
    expect(response.body.error).toBe("Veuillez souscrire à une formule d'abonnement supérieure");
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' }).query({
      fn: 'dd',
      sector: 1548,
      zone: [true],
    });

    expect(response.status).toBe(422);
    expect(scrapeCV).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(getTotalMonthValues).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Invalid type for keys: query.sector: Expected array, received number');
  });

  //; scrape search out of limit
  it('scrape search out of limit => 605 error ( Limite de recherche mensuelle atteinte avec votre abonnement ) ', async () => {
    getTotalMonthValues.mockResolvedValue({ cv: 100 } as Record<scoreColumn, number>);
    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' }).query({
      fn: 'developer web',
      sector: 'informatique',
      matching: 50,
    });

    expect(scrapeCV).not.toHaveBeenCalled();
    expect(getTotalMonthValues).toHaveBeenNthCalledWith(1, 1, ['cv']);
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(response.status).toBe(605);
    expect(response.body.error).toBe('Limite de recherche mensuelle atteinte avec votre abonnement PRO.');
  });

  //; scrape page with error status
  it('scrape page with error status => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 695,
      url: () => cvUrl,
      text: () => blankPage,
    } as any);

    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      fn: 'developer web',
      sector: 'informatique',
      matching: 50,
    });

    ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser });
    expect(getNumber).not.toHaveBeenCalled();
    expect(closeBrowser).toHaveBeenCalledTimes(1);
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; scrape with 200 status but without google content
  it('scrape with 200 status but without google content => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => cvUrl,
      text: () => blankPage,
    } as any);

    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      fn: 'developer web',
      sector: 'informatique',
      matching: 50,
    });

    ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser });
    expect(getNumber).toHaveBeenNthCalledWith(1, blankPage);
    expect(closeBrowser).toHaveBeenCalledTimes(1);
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(newStream).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; scraping data without firstResult
  it('scraping data without firstResult => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => cvUrl,
      text: () => dataPage,
    } as any);

    getStreamUser.mockResolvedValue([]);
    streamStrategies.mockResolvedValue(undefined);

    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser });

    expect(getNumber).toHaveBeenNthCalledWith(1, dataPage);
    expect(closeBrowser).toHaveBeenCalledTimes(1);
    //
    expect(userCandidateFavoris).toHaveBeenNthCalledWith(1, 1, true);
    expect(newStream).toHaveBeenNthCalledWith(1, {
      streamValues: ['https://link-to-get'],
      streamOption: cvForm,
      userId: 1,
      streamTask: 'cv',
      memoryValue: undefined,
    });
    expect(redisMock.set).toHaveBeenNthCalledWith(1, expect.stringMatching(/^Stream\.1\./), JSON.stringify({ task: 'cv' }));
    expect(getMemory).toHaveBeenCalledTimes(1);
    expect(process).toHaveBeenNthCalledWith(1, {
      streamTask: 'cv',
      streamValues: ['https://link-to-get'],
      streamOption: cvForm,
    });
    expect(memoryData).toEqual(new Map());
    expect(execute).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; scraping same task in double
  it('scraping same task in double => 200 cv scrapping', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => cvUrl,
      text: () => dataMultiplePages,
    } as any);

    socketMocked.socketUserList.set('1', {
      refreshToken: 'refreshToken',
      socketId: 'socketId',
      secret_key: 'secret_key',
    });

    getStreamUser.mockResolvedValue([{ key: 'Stream.1.kklloopp', value: { task: 'cv' } }]);
    streamStrategies.mockResolvedValue({
      favFolderId: undefined,
      fullName: 'Alex',
      resume: 'Jest test',
      matching: 50,
      pdf: 'pdfLink',
      img: 'img',
    });
    checkStream
      .mockImplementation(async function () {
        const previousActiveTasks = await this.MemoryServer.getMemory('Stream.1.kklloopp');
        if (previousActiveTasks) {
          await this.MemoryServer.delMemory('Stream.1.kklloopp');
          await this.redisClient.del('Stream.1.kklloopp');
          return true;
        }
      })
      .mockImplementationOnce(async () => false);

    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser });
    expect(getNumber).toHaveBeenNthCalledWith(1, dataMultiplePages);
    expect(closeBrowser).toHaveBeenCalledTimes(1);
    //
    expect(userCandidateFavoris).toHaveBeenNthCalledWith(1, 1, true);
    expect(decrementCv).not.toHaveBeenCalled();
    expect(newStream).toHaveBeenNthCalledWith(1, {
      streamValues: ['https://link-to-get', 'https://link-to-get-2'],
      streamOption: cvForm,
      userId: 1,
      streamTask: 'cv',
      memoryValue: undefined,
    });
    expect(setMemory).toHaveBeenNthCalledWith(1, 'Stream.1.kklloopp', true);
    expect(redisMock.set).toHaveBeenNthCalledWith(1, 'Cache.Stream.1.kklloopp', 'true');
    expect(redisMock.set).toHaveBeenNthCalledWith(2, expect.stringMatching(/^Stream\.1\./), '{"task":"cv"}');
    expect(redisMock.del).toHaveBeenNthCalledWith(1, 'Cache.Stream.1.kklloopp');
    expect(redisMock.del).toHaveBeenNthCalledWith(2, 'Stream.1.kklloopp');
    expect(getMemory).toHaveBeenNthCalledWith(1, 'Stream.1.kklloopp');
    expect(delMemory).toHaveBeenNthCalledWith(1, 'Stream.1.kklloopp');
    expect(memoryData).toEqual(new Map());
    expect(process).toHaveBeenNthCalledWith(1, {
      streamTask: 'cv',
      streamValues: ['https://link-to-get', 'https://link-to-get-2'],
      streamOption: cvForm,
    });
    expect(checkStream).toHaveBeenCalledTimes(2);
    expect(streamStrategies).toHaveBeenNthCalledWith(1, { streamOption: cvForm, value: 'https://link-to-get' }, 'cv');
    expect(execute).toHaveBeenNthCalledWith(1, { remainingValues: ['https://link-to-get-2'], streamOption: cvForm, streamTask: 'cv' });
    expect(improveScore).toHaveBeenNthCalledWith(1, ['cv'], 1, 1);
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, '1', {
      eventName: 'cv',
      body: { isCancel: true },
      date: '01/01/2024',
    });
    expect(socketMocked.socketEmitted).toEqual([
      {
        eventName: 'cv',
        body: { isCancel: true },
        date: '01/01/2024',
      },
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { index: 50, start: 0, total: 2480 },
      firstResult: {
        fullName: 'Alex',
        resume: 'Jest test',
        matching: 50,
        pdf: 'pdfLink',
        img: 'img',
      },
    });
  });
  //; scraping cv and send by socketIo
  it('scraping cv and send by socketIo => 200 cv scrapping', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => cvUrl,
      text: () => dataMultiplePages,
    } as any);

    socketMocked.socketUserList.set('1', {
      refreshToken: 'refreshToken',
      socketId: 'socketId',
      secret_key: 'secret_key',
    });

    streamStrategies.mockResolvedValue({
      favFolderId: undefined,
      fullName: 'Alex',
      resume: 'Jest test',
      matching: 50,
      pdf: 'pdfLink',
      img: 'img',
    });

    const response = await scrapeCVRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser });
    expect(getNumber).toHaveBeenNthCalledWith(1, dataMultiplePages);
    expect(closeBrowser).toHaveBeenCalledTimes(1);
    //
    expect(userCandidateFavoris).toHaveBeenNthCalledWith(1, 1, true);
    expect(decrementCv).not.toHaveBeenCalled();
    expect(newStream).toHaveBeenNthCalledWith(1, {
      streamValues: ['https://link-to-get', 'https://link-to-get-2'],
      streamOption: cvForm,
      userId: 1,
      streamTask: 'cv',
      memoryValue: undefined,
    });
    expect(redisMock.set).toHaveBeenNthCalledWith(1, expect.stringMatching(/^Stream\.1\./), JSON.stringify({ task: 'cv' }));
    expect(getMemory).toHaveBeenCalledTimes(2);
    expect(memoryData).toEqual(new Map());
    expect(process).toHaveBeenNthCalledWith(1, {
      streamTask: 'cv',
      streamValues: ['https://link-to-get', 'https://link-to-get-2'],
      streamOption: cvForm,
    });
    expect(checkStream).toHaveBeenCalledTimes(2);
    expect(streamStrategies).toHaveBeenNthCalledWith(1, { streamOption: cvForm, value: 'https://link-to-get' }, 'cv');
    expect(streamStrategies).toHaveBeenNthCalledWith(2, { streamOption: cvForm, value: 'https://link-to-get-2' }, 'cv');
    expect(execute).toHaveBeenNthCalledWith(1, { remainingValues: ['https://link-to-get-2'], streamOption: cvForm, streamTask: 'cv' });
    expect(improveScore).toHaveBeenNthCalledWith(1, ['cv'], 1, 1);
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, '1', {
      eventName: 'cv',
      body: {
        favFolderId: undefined,
        fullName: 'Alex',
        resume: 'Jest test',
        matching: 50,
        pdf: 'pdfLink',
        img: 'img',
      },
      date: '01/01/2024',
    });
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(2, '1', {
      eventName: 'cv',
      body: { isEnd: true },
      date: '01/01/2024',
    });
    expect(socketMocked.socketEmitted).toEqual([
      {
        eventName: 'cv',
        body: {
          favFolderId: undefined,
          fullName: 'Alex',
          resume: 'Jest test',
          matching: 50,
          pdf: 'pdfLink',
          img: 'img',
        },
        date: '01/01/2024',
      },
      {
        eventName: 'cv',
        body: { isEnd: true },
        date: '01/01/2024',
      },
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { index: 50, start: 0, total: 2480 },
      firstResult: {
        fullName: 'Alex',
        resume: 'Jest test',
        matching: 50,
        pdf: 'pdfLink',
        img: 'img',
      },
    });
  });
});
