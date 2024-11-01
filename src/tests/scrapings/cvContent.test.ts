import type { AxiosJest, tesseractJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import * as signedPDF from '@/utils/customPDF';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import axiosMocked from '../jest-helpers/spy-modules/axios';
import pdfToPngMocked from '../jest-helpers/spy-modules/pdfToPng';
import tesseractMocked from '../jest-helpers/spy-modules/tesseract';

describe('GET scrapping/cv/:link', () => {
  const scrapeCVContentRequest = (params: string, auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).get(`/api/scrapping/cv/${params}`).set('Cookie', authCookieValue);
    }
    return request(global.app).get(`/api/scrapping/cv/${params}`);
  };

  let getAxios: AxiosJest['get'];
  let tesseract: tesseractJest;
  let signedCv: jest.SpyInstance<Promise<string>, [data: Buffer], any>;

  beforeEach(() => {
    getAxios = axiosMocked().get;
    pdfToPngMocked();
    tesseract = tesseractMocked();
    signedCv = jest.spyOn(signedPDF, 'default').mockResolvedValue('Signed pdf BUFFER');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await scrapeCVContentRequest('cvContentLink');

    expect(response.status).toBe(999);
    expect(getAxios).not.toHaveBeenCalled();
    expect(tesseract).not.toHaveBeenCalled();
    expect(signedCv).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; scrape cv Content with free Account
  it("scrape cv Content with free Account => 605 error ( Veuillez souscrire à une formule d'abonnement supérieure )", async () => {
    const response = await scrapeCVContentRequest('cvContentLink', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' });

    expect(response.status).toBe(605);
    expect(getAxios).not.toHaveBeenCalled();
    expect(tesseract).not.toHaveBeenCalled();
    expect(signedCv).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Veuillez souscrire à une formule d'abonnement supérieure");
  });

  //; axios cannot read link url
  it('axios cannot read link url => 422 error (Auth required)', async () => {
    getAxios.mockResolvedValue({ status: 404, data: undefined });
    const response = await scrapeCVContentRequest('cvContentLink', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' });

    expect(response.status).toBe(422);
    expect(getAxios).toHaveBeenNthCalledWith(1, 'cvContentLink', { responseType: 'arraybuffer' });
    expect(tesseract).not.toHaveBeenCalled();
    expect(signedCv).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Erreur lors du chargement du contenu du CV.');
  });

  //; pdf have more than 2 pages
  it('pdf have more than 2 pages => 422 error (Auth required)', async () => {
    getAxios.mockResolvedValue({ status: 200, data: 'Jest exeeded!' });
    const response = await scrapeCVContentRequest('cvContentLink', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' });

    expect(response.status).toBe(422);
    expect(getAxios).toHaveBeenNthCalledWith(1, 'cvContentLink', { responseType: 'arraybuffer' });
    expect(tesseract).not.toHaveBeenCalled();
    expect(signedCv).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Erreur lors du chargement du contenu du CV.');
  });

  //; pdf without text extracted by pdf and Tesseract
  it('pdf without text extracted by pdf and Tesseract => 422 error (Auth required)', async () => {
    getAxios.mockResolvedValue({ status: 200, data: 'Jest no result' });
    tesseract.mockResolvedValue({ data: { text: undefined } } as any);
    const response = await scrapeCVContentRequest('cvContentLink', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' });

    expect(response.status).toBe(422);
    expect(getAxios).toHaveBeenNthCalledWith(1, 'cvContentLink', { responseType: 'arraybuffer' });
    expect(tesseract).toHaveBeenNthCalledWith(1, 'Buffer', 'fra');
    expect(signedCv).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Erreur lors du chargement du contenu du CV.');
  });

  //; pdf with text extracted by pdf
  it('pdf with text extracted by pdf => 200 status (Auth required)', async () => {
    getAxios.mockResolvedValue({ status: 200, data: 'Jest Signed Data' });
    const response = await scrapeCVContentRequest('cvContentLink', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'pro' });

    expect(response.status).toBe(200);
    expect(getAxios).toHaveBeenNthCalledWith(1, 'cvContentLink', { responseType: 'arraybuffer' });
    expect(tesseract).not.toHaveBeenCalled();
    expect(signedCv).toHaveBeenNthCalledWith(1, 'Jest Signed Data');

    expect(response.body).toHaveProperty('editedPDF');
    expect(response.body.editedPDF).toBe('Signed pdf BUFFER');
  });
});
