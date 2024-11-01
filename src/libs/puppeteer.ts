import { puppeteerCandidateProps, puppeteerCandidateResult, puppeteerCVProps, puppeteerCVResult, puppeteerResult } from '@/interfaces/scrapping';
import config from '@config';
import { InvalidArgumentError, PuppeteerError, ServerException } from '@exceptions';
import { logger } from '@utils/logger';
import axios from 'axios';
import { load } from 'cheerio';
import { exec } from 'child_process';
import type { Browser, LaunchOptions, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import util from 'util';
import { SkipInTest } from './decorators';
const { proxy, IP } = config;
export class ApiPuppeteer {
  private proxyServer: string = proxy.SERVER;
  private proxyUsername: string = proxy.USERNAME;
  private proxyPassword: string = proxy.PASSWORD;
  private browser: Browser | null = null;
  protected needProxy: boolean = true;

  protected check({ url, type, strategy }: puppeteerCandidateProps | puppeteerCVProps) {
    try {
      if (!url || typeof url !== 'string') {
        throw new InvalidArgumentError('url is a required property and must be a string.');
      }
      if (!type || !['cv', 'reseaux'].includes(type)) {
        throw new InvalidArgumentError('Option "type" needs to be a string cv or reseaux.');
      }

      if (!strategy || typeof strategy !== 'function') {
        throw new InvalidArgumentError('Option "strategy" needs to be an array.');
      }
      SkipInTest(() =>
        logger.info(`---------------
      puppeteer check successfully
      ---------------`),
      )();
    } catch (error) {
      logger.error('ApiPuppeteer.check =>', error);
      throw error;
    }
  }

  private getNumber(values: string): number | undefined {
    try {
      const $ = load(values);
      const nResults = $('#result-stats').text();

      const match = nResults.match(/(\d+(?:[.,]\d{3})*(?:\s+\d{3})*)\s*résultats/);

      if (match) {
        return Number.parseInt(match[1].replace(/\s/g, ''), 10);
      }
      return undefined;
    } catch (error) {
      logger.error('ApiPuppeteer.getNumber =>', error);
      return undefined;
    }
  }

  private async testProxy(): Promise<boolean> {
    try {
      if (!this.needProxy) {
        return true;
      }
      const execPromise = util.promisify(exec);
      const [host, port] = this.proxyServer?.split(':');
      const command = `curl -vvv https://ipv4.icanhazip.com --proxy http://${this.proxyUsername}:${this.proxyPassword}@${host}:${port}`;
      const { stdout } = await execPromise(command);
      if (!stdout) {
        throw new Error('no data');
      }
      const ip = stdout.trim();
      if (ip !== IP && !isNaN(Number.parseInt(ip))) {
        return true;
      }
      return false;
    } catch (error) {
      logger.error('ApiPuppeteer.testProxy =>', error);
      return false;
    }
  }

  private async init(): Promise<void> {
    try {
      puppeteer.use(StealthPlugin());
      const proxyIsWorking = await this.testProxy();
      if (!proxyIsWorking) {
        logger.info('Proxy test failed');
        const { SERVER, USERNAME, PASSWORD } = proxy.v2;
        this.proxyServer = SERVER;
        this.proxyUsername = USERNAME;
        this.proxyPassword = PASSWORD;
      }
      const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-features=site-per-process',
        '--enable-features=NetworkService',
        '--allow-running-insecure-content',
        '--enable-automation',
        '--disable-background-timer-throttling',
        '--ignore-certificate-errors-spki-list',
        '--ignore-certificate-errors',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-infobars',
        '--ignore-certifcate-errors-spki-list',
        '--ignore-certifcate-errors',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-speech-api',
        '--disk-cache-size=33554432',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-zygote',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
      ];
      if (this.needProxy) {
        args.push(`--proxy-server=${this.proxyServer}`);
      }
      this.browser = await puppeteer.launch({
        headless: 'new',
        executablePath: config.EXECUTABLE_PATH,
        args,
        timeout: 15000,
        ignoreHTTPSErrors: true,
      } as LaunchOptions);
      SkipInTest(() => logger.info(`Puppeteer launched!`))();
    } catch (error) {
      // Kill Puppeteer
      logger.error('ApiPuppeteer.init =>', error);
      await this.close();
      throw new ServerException();
    }
  }

  private async configurePage(page: Page) {
    try {
      if (page) {
        const session = await page.target().createCDPSession();
        await page.setBypassCSP(true);
        await session.send('Page.enable');
        await session.send('Page.setWebLifecycleState', {
          state: 'active',
        });

        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 OPR/103.0.0.0',
        );

        await page.setRequestInterception(true);

        if (this.needProxy) {
          await page.authenticate({
            username: this.proxyUsername,
            password: this.proxyPassword,
          });
        }

        page.on('request', request => {
          const resourceTypesAccepted = ['document'];
          if (resourceTypesAccepted.includes(request.resourceType())) {
            request.continue();
          } else {
            request.abort();
          }
        });
        return page;
      }
      throw new PuppeteerError('Failed to configure page');
    } catch (error) {
      logger.error('ApiPuppeteer.configurePage =>', error);
      throw error;
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (err) {
          logger.error('ApiPuppeteer closing page error => ', err);
        }
      }
    }
  }

  private async scrapePage<T>({
    page,
    url,
    handler,
  }: {
    page: Page;
    url: string;
    handler: (responseBody: string) => Promise<T>;
  }): Promise<T | undefined> {
    try {
      const response = await page.goto(url);
      if (response && response.status() === 200 && response.url().startsWith('https://www.google.com/search')) {
        const responseBody = await response.text();

        if (!responseBody) {
          throw new PuppeteerError();
        }
        return await handler(responseBody);
      }

      throw new PuppeteerError();
    } catch (puppeteerError) {
      try {
        const { status, data } = await axios.get(url);
        if (status === 200 && data) {
          return await handler(data);
        }
        throw new PuppeteerError('Failed to load page');
      } catch (axiosError) {
        logger.error('ApiPuppeteer.scrapePage axios error => ', axiosError);
        return undefined;
      }
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (err) {
          logger.error('ApiPuppeteer closing page error => ', err);
        }
      }
    }
  }

  private async scrapperReseaux({ page, data: { strategy, url } }: { page: Page; data: puppeteerCandidateProps }) {
    try {
      const handler = async (responseBody: string): Promise<puppeteerCandidateResult | undefined> => {
        const res = strategy(responseBody);
        const scrapeResult = res instanceof Promise ? await res : res;

        return { scrapeResult, total: this.getNumber(responseBody) };
      };
      return this.scrapePage<puppeteerCandidateResult | undefined>({ page, url, handler });
    } catch (error) {
      logger.error('ApiPuppeteer.scrapperReseaux => ', error);
      return undefined;
    }
  }

  private async scrapperCV({ page, data: { url, strategy } }: { page: Page; data: puppeteerCVProps }) {
    try {
      const handler = async (responseBody: string): Promise<puppeteerCVResult | undefined> => {
        const cvLinks = strategy(responseBody);
        return { cvLinks, total: this.getNumber(responseBody) };
      };
      return this.scrapePage<puppeteerCVResult | undefined>({ page, url, handler });
    } catch (error) {
      logger.error('ApiPuppeteer.scrapperCV => ', error);
      return undefined;
    }
  }

  protected async open(data: puppeteerCandidateProps | puppeteerCVProps): Promise<puppeteerResult | undefined> {
    await this.init();

    SkipInTest(() => logger.info(`Puppeteer scrapping!`))();

    const page: Page = await this.browser!.newPage();
    const modifiedPage = await this.configurePage(page);
    try {
      switch (data.type) {
        case 'reseaux':
          const { scrapeResult, total: totalProfile = 0 } = (await this.scrapperReseaux({ page: modifiedPage, data })) || {};
          if (!scrapeResult || totalProfile < 1) return undefined;

          return { data: scrapeResult, total: totalProfile };

        case 'cv':
          const { cvLinks, total: totalCv = 0 } = (await this.scrapperCV({ page: modifiedPage, data })) || {};
          if (!cvLinks || totalCv < 1) return undefined;
          return { data: cvLinks, total: totalCv };

        default:
          return undefined;
      }
    } catch (error) {
      logger.error('ApiPuppeteer.open => ', error);
      return undefined;
    } finally {
      if (!modifiedPage.isClosed()) {
        await modifiedPage.close();
      }
      this.close();
    }
  }

  protected async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        logger.info('Closed browser!');
      } catch (err) {
        logger.error('ApiPuppeteer.close => ', err);
        throw err;
      }
    }
  }
}
