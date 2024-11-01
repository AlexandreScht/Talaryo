import type { AxiosJest, FavorisServicesJest, PuppeteerJest, ScoresServicesJest, ScraperServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import { blankCandidatePage, candidateUrl, dataCandidatePage, ExpectedCandidatePuppeteer } from '../jest-helpers/scraping_candidate';
import puppeteerMocked, { mockBrowser, mockPage } from '../jest-helpers/spy-libs/puppeteer';
import axiosMocked from '../jest-helpers/spy-modules/axios';
import favorisMockedService from '../jest-helpers/spy-services/favoris';
import scoresMockedService from '../jest-helpers/spy-services/scores';
import scraperMockedService from '../jest-helpers/spy-services/scraper';

describe('GET scrapping/candidate', () => {
  const scrapeCandidateRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get('/api/scrapping/candidate').set('Cookie', authCookieValue);
    }
    return request(global.app).get('/api/scrapping/candidate');
  };

  let scrapeCandidate: ScraperServicesJest['scrapeCandidate'];
  let userCandidateFavoris: FavorisServicesJest['userCandidateFavoris'];
  let improveScore: ScoresServicesJest['improveScore'];

  let checkPuppeteer: PuppeteerJest['check'];
  let scrapePage: PuppeteerJest['scrapePage'];
  let configurePage: PuppeteerJest['configurePage'];
  let openSpy: PuppeteerJest['open'];
  let scrapperReseauxSpy: PuppeteerJest['scrapperReseaux'];
  let closeBrowser: PuppeteerJest['close'];
  let getNumber: PuppeteerJest['getNumber'];
  let init: PuppeteerJest['init'];

  let getAxios: AxiosJest['get'];

  beforeEach(() => {
    //? axios
    getAxios = axiosMocked().get;

    //? services
    scrapeCandidate = scraperMockedService().scrapeCandidate;
    userCandidateFavoris = favorisMockedService().userCandidateFavoris;
    improveScore = scoresMockedService().improveScore;

    //? puppeteer
    checkPuppeteer = puppeteerMocked().check;
    scrapePage = puppeteerMocked().scrapePage;
    configurePage = puppeteerMocked().configurePage;
    openSpy = puppeteerMocked().open;
    scrapperReseauxSpy = puppeteerMocked().scrapperReseaux;
    closeBrowser = puppeteerMocked().close;
    getNumber = puppeteerMocked().getNumber;
    init = puppeteerMocked().init;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await scrapeCandidateRequest();

    expect(response.status).toBe(999);
    expect(scrapeCandidate).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      platform: 'celo',
      fn: 'dd',
      sector: 1548,
      zone: [true],
    });

    expect(response.status).toBe(422);
    expect(scrapeCandidate).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      "Invalid type for keys: query.platform: Invalid enum value. Expected 'LinkedIn' | 'Viadeo' | 'Xing' | 'Batiactu' | 'Dribble' | 'Behance' | 'Culinary agents' | 'Symfony' | 'HEC' | 'Polytechnique' | 'Ferrandi' | 'UTC' | 'Centrale Supélec' | 'Centrale Lille' | 'Essec' | 'Neoma', received 'celo' - query.sector: Expected array, received number",
    );
  });

  //; scrape search out of limit
  it('scrape search out of limit => 605 error ( Limite de recherche mensuelle atteinte avec votre abonnement ) ', async () => {
    scoresMockedService().getTotalMonthValues.mockResolvedValue({ searches: 10 });
    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    expect(scrapeCandidate).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(605);
    expect(response.body.error).toBe('Limite de recherche mensuelle atteinte avec votre abonnement FREE.');
  });

  //; scrape pro platform with free account
  it('scrape pro platform with free account => 605 error ( Veuillez souscrire à un plan supérieur pour accéder à la plateforme ) ', async () => {
    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).query({
      platform: 'Viadeo',
      fn: 'developer web',
      sector: 'informatique',
    });

    expect(scrapeCandidate).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(605);
    expect(response.body.error).toBe('Veuillez souscrire à un plan supérieur pour accéder à la plateforme : Viadeo.');
  });

  //; scrape page with error status and axios rejected
  it('scrape page with error status and axios rejected => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 695,
      url: () => candidateUrl,
      text: () => 'google',
    } as any);

    getAxios.mockResolvedValue({ status: 400, data: '' });

    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCandidatePuppeteer({
      scrapeCandidate,
      checkPuppeteer,
      openSpy,
      configurePage,
      scrapperReseauxSpy,
      mockPage,
      scrapePage,
      mockBrowser,
      init,
      closeBrowser,
    });
    expect(getAxios).toHaveBeenNthCalledWith(1, candidateUrl);

    expect(getNumber).not.toHaveBeenCalled();
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; scrape page with undefined body and axios resolved blank page
  it('scrape page with undefined body and axios resolved blank page => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => candidateUrl,
      text: () => undefined,
    } as any);

    getAxios.mockResolvedValue({ status: 200, data: blankCandidatePage });

    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCandidatePuppeteer({
      scrapeCandidate,
      checkPuppeteer,
      openSpy,
      configurePage,
      scrapperReseauxSpy,
      mockPage,
      scrapePage,
      mockBrowser,
      init,
      closeBrowser,
    });
    expect(getAxios).toHaveBeenNthCalledWith(1, candidateUrl);
    expect(getNumber).toHaveBeenNthCalledWith(1, blankCandidatePage);
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; scrape with 200 status but without google content
  it('scrape with 200 status but without google content => 204 status', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => candidateUrl,
      text: () => blankCandidatePage,
    } as any);

    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCandidatePuppeteer({
      scrapeCandidate,
      checkPuppeteer,
      openSpy,
      configurePage,
      scrapperReseauxSpy,
      mockPage,
      scrapePage,
      mockBrowser,
      init,
      closeBrowser,
    });
    expect(getAxios).not.toHaveBeenCalled();
    expect(getNumber).toHaveBeenNthCalledWith(1, blankCandidatePage);
    expect(userCandidateFavoris).not.toHaveBeenCalled();
    expect(improveScore).not.toHaveBeenCalled();
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  //; Puppeteer rejection but axios success
  it('Puppeteer rejection but axios success => 200 status / candidates', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 204,
      url: () => candidateUrl,
      text: () => blankCandidatePage,
    } as any);

    getAxios.mockResolvedValue({ status: 200, data: dataCandidatePage });

    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCandidatePuppeteer({
      scrapeCandidate,
      checkPuppeteer,
      openSpy,
      configurePage,
      scrapperReseauxSpy,
      mockPage,
      scrapePage,
      mockBrowser,
      init,
      closeBrowser,
    });
    expect(getAxios).toHaveBeenNthCalledWith(1, candidateUrl);
    expect(getNumber).toHaveBeenNthCalledWith(1, dataCandidatePage);
    expect(userCandidateFavoris).toHaveBeenNthCalledWith(1, 1);

    expect(improveScore).toHaveBeenNthCalledWith(1, ['searches'], 1, 1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        index: 50,
        start: 0,
        total: 1230,
      },
      links: [
        {
          currentCompany: 'TechCorp',
          currentJob: 'Développeuse Web',
          fullName: 'Jane Doe',
          img: expect.stringMatching(/^https:\/\/lh3\.googleusercontent\.com\/pw\/AP1Gcz/),
          link: 'https://www.linkedin.com/in/jane-doe',
          resume: 'Passionnée par le développement front-end et les technologies modernes.',
        },
      ],
    });
  });

  //; scraping data
  it('scraping data => 200 status / candidates', async () => {
    mockPage.goto.mockResolvedValue({
      status: () => 200,
      url: () => candidateUrl,
      text: () => dataCandidatePage,
    } as any);

    const response = await scrapeCandidateRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'business' }).query({
      platform: 'LinkedIn',
      fn: 'developer web',
      sector: 'informatique',
    });

    ExpectedCandidatePuppeteer({
      scrapeCandidate,
      checkPuppeteer,
      openSpy,
      configurePage,
      scrapperReseauxSpy,
      mockPage,
      scrapePage,
      mockBrowser,
      init,
      closeBrowser,
    });
    expect(getAxios).not.toHaveBeenCalled();

    expect(getNumber).toHaveBeenNthCalledWith(1, dataCandidatePage);
    expect(userCandidateFavoris).toHaveBeenNthCalledWith(1, 1);

    expect(improveScore).toHaveBeenNthCalledWith(1, ['searches'], 1, 1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        index: 50,
        start: 0,
        total: 1230,
      },
      links: [
        {
          currentCompany: 'TechCorp',
          currentJob: 'Développeuse Web',
          fullName: 'Jane Doe',
          img: expect.stringMatching(/^https:\/\/lh3\.googleusercontent\.com\/pw\/AP1Gcz/),
          link: 'https://www.linkedin.com/in/jane-doe',
          resume: 'Passionnée par le développement front-end et les technologies modernes.',
        },
      ],
    });
  });
});
