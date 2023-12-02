import { cheerioResult, puppeteerProps, scrappingResult } from '@/interfaces/scrapping';
import config from '@config';
import { InvalidArgumentError, ServerException } from '@exceptions';
import { logger } from '@utils/logger';
import { load } from 'cheerio';
import type { Page } from 'puppeteer';
import { executablePath } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
const { proxy } = config;

export class ApiPuppeteer {
  private proxyServer: string = proxy.SERVER;
  private proxyUsername: string = proxy.USERNAME;
  private proxyPassword: string = proxy.PASSWORD;
  private browser: Cluster | null = null;

  protected check(data: puppeteerProps[]) {
    data.map(v => {
      if (!v.url || typeof v.url !== 'string') {
        throw new InvalidArgumentError('url is a required property and must be a string.');
      }

      if (!v.props || !Array.isArray(v.props)) {
        throw new InvalidArgumentError('Option "props" needs to be an array.');
      }
      if (v.current && typeof v.url !== 'boolean') {
        throw new InvalidArgumentError('Option "currentCompany" needs to be a boolean.');
      }
    });

    logger.info(`---------------
    puppeteer check successfully
    ---------------`);
  }

  private getNumber(values: string): number | undefined {
    const $ = load(values);
    const nResults = $('#result-stats').text();
    const match = nResults.match(/(\d+(?:[.,]\d{3})*(?:\s+\d{3})*)\s*résultats/);

    if (match) {
      return Number.parseInt(match[1].replace(/\s/g, ''), 10);
    }
    return undefined;
  }

  private async init(): Promise<void> {
    try {
      puppeteer.use(StealthPlugin());
      this.browser = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 10,
        puppeteerOptions: {
          headless: 'new',
          executablePath: executablePath(),
          args: [
            `--proxy-server=${this.proxyServer}`,
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
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
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
          ],
          ignoreHTTPSErrors: true,
        },
      });
      logger.info(`Puppeteer launched!`);
    } catch (error) {
      // Kill Puppeteer
      logger.error('puppeteer browser error: ' + error);
      await this.close();
      throw new ServerException();
    }
  }

  private async scrapper({
    page,
    data: { props, url },
  }: {
    page: Page;
    data: puppeteerProps;
  }): Promise<[boolean, [cheerioResult, number | undefined]?]> {
    return new Promise(async resolve => {
      try {
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

        page.on('request', request => {
          const resourceTypesAccepted = ['document'];
          if (resourceTypesAccepted.includes(request.resourceType())) {
            request.continue();
          } else {
            request.abort();
          }
        });

        await page.authenticate({
          username: this.proxyUsername,
          password: this.proxyPassword,
        });

        page.on('response', async response => {
          if (response.status() === 302) {
            resolve([true]);
          }

          if (response.url().startsWith(props[1]) && response.status() === 200) {
            const responseBody = await response.text();
            if (!responseBody) {
              await page.close();
              resolve([true]);
            }
            const res: cheerioResult = props[0](responseBody);
            await page.close();
            resolve([false, [res, this.getNumber(responseBody)]]);
          }
        });

        await page.goto(url);
      } catch (err) {
        // Kill Puppeteer
        await this.close();
        resolve([err]);
      }
    });
  }

  protected async open(values: puppeteerProps[]): Promise<[boolean, scrappingResult[]?]> {
    try {
      if (!this.browser) {
        await this.init();
      }

      this.browser.task(async ({ page, data }: { page: Page; data: puppeteerProps }) => {
        logger.info(`scrapping: ${data.url}`);
        const [error, res] = await this.scrapper({ page, data });
        if (error) {
          data.retryCount++;
          if (data.retryCount < 3) {
            logger.error(`Error on scrapping: ${data.url}`);
            this.browser.queue(data);
          } else {
            result.push({ data: undefined, current: true });
          }
        } else {
          result.push({ data: res[0], number: res[1], current: data.current });
        }
      });

      const result: scrappingResult[] = [];
      logger.info(`Puppeteer scrapping!`);
      values.forEach(option => {
        this.browser.queue(option);
      });
      await this.close();
      return [false, result];
    } catch (error) {
      logger.error(`Error on open: ${error}`);
      await this.close();
      return [true];
    }
  }

  protected close(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.browser) {
        try {
          await this.browser.idle();
          await this.browser.close();
          this.browser = null;
          logger.info('Closed browser !');
        } catch (err) {
          logger.error(`error on Closed browser: ${err}`);
          reject(err);
        }
      }

      return resolve();
    });
  }
}
