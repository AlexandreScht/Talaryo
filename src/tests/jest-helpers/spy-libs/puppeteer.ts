import { PuppeteerJest } from '@/interfaces/jest';
import { ApiPuppeteer } from '@/libs/puppeteer';
import type { Browser, Page } from 'puppeteer';

export const mockPage = {
  goto: jest.fn(),
  setRequestInterception: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
  isClosed: jest.fn().mockReturnValue(false),
} as unknown as jest.Mocked<Page>;

export const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn(),
} as jest.Mocked<Partial<Browser>>;

export default function puppeteerMocked(): PuppeteerJest {
  const configurePage = jest.spyOn(ApiPuppeteer.prototype as any, 'configurePage').mockResolvedValue(mockPage);
  const init = jest.spyOn(ApiPuppeteer.prototype as any, 'init').mockImplementation(async function () {
    this.browser = mockBrowser;
    this.needProxy = false;
  });
  const check = jest.spyOn(ApiPuppeteer.prototype as any, 'check');
  const scrapePage = jest.spyOn(ApiPuppeteer.prototype as any, 'scrapePage');
  const open = jest.spyOn(ApiPuppeteer.prototype as any, 'open');
  const scrapperReseaux = jest.spyOn(ApiPuppeteer.prototype as any, 'scrapperReseaux');
  const scrapperCv = jest.spyOn(ApiPuppeteer.prototype as any, 'scrapperCV');
  const close = jest.spyOn(ApiPuppeteer.prototype as any, 'close');
  const getNumber = jest.spyOn(ApiPuppeteer.prototype as any, 'getNumber');
  const testProxy = jest.spyOn(ApiPuppeteer.prototype as any, 'testProxy');

  return { configurePage, init, check, scrapePage, open, scrapperReseaux, scrapperCv, close, getNumber, testProxy } as PuppeteerJest;
}
