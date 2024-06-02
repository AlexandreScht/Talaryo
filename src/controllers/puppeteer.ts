import { logger } from '@utils/logger';
import type { Page } from 'puppeteer';
import { executablePath } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { InvalidArgumentError, ServerException } from '../exceptions';
import { cheerioResult, puppeteerProps, scrappingResult } from '../interfaces/scrapping';

export class ApiPuppeteer {
  private browser: Cluster | null = null;
  private values: puppeteerProps[] = [];

  private check() {
    this.values.map(v => {
      if (!v.id || typeof v.id !== 'number') {
        throw new InvalidArgumentError('id is a required property and must be a number.');
      }
      if (!v.url || typeof v.url !== 'string') {
        throw new InvalidArgumentError('url is a required property and must be a string.');
      }

      if (!v.cheerio || typeof v.cheerio !== 'function') {
        throw new InvalidArgumentError('Option "props" needs to be an array.');
      }
    });

    logger.info(`---------------
    puppeteer check successfully
    ---------------`);
  }

  private async init(): Promise<void> {
    this.check();
    try {
      puppeteer.use(StealthPlugin());
      this.browser = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 10,
        puppeteerOptions: {
          headless: true,
          executablePath: executablePath(),
          args: [
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

  private async scrapper({ page, data: { url, cheerio } }: { page: Page; data: puppeteerProps }): Promise<[boolean, cheerioResult[]?]> {
    return new Promise(async resolve => {
      try {
        const session = await page.createCDPSession();
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

        page.on('response', async response => {
          if (response.status() === 302) {
            resolve([true]);
          }

          if (response.status() === 200) {
            const responseBody = await response.text();
            if (!responseBody) {
              await page.close();
              resolve([true]);
            }
            const res: cheerioResult[] = cheerio(responseBody);
            await page.close();
            if (res instanceof Promise) {
              const result: cheerioResult[] = await res;
              resolve([false, result]);
            }
            resolve([false, res]);
          }
        });

        await page.goto(url, { waitUntil: 'networkidle2' });
      } catch (err) {
        // Kill Puppeteer
        await this.close();
        resolve([true]);
      }
    });
  }

  protected async open(values: puppeteerProps[]): Promise<[boolean, scrappingResult[]?]> {
    try {
      if (!this.browser || !this.values) {
        this.values = values;
        await this.init();
      }

      this.browser.task(async ({ page, data }: { page: Page; data: puppeteerProps }) => {
        logger.info(`scrapping: ${data.url}`);
        const [error, res] = await this.scrapper({ page, data });
        if (error) {
          logger.error(`Error on scrapping: ${data.url}`);
          result.push(undefined);
        } else {
          result.push({ id: data.id, result: res });
        }
      });

      const result: scrappingResult[] = [];
      logger.info(`Puppeteer scrapping!`);
      values.forEach(option => {
        this.browser.queue(option);
      });
      await this.close();
      return [false, result.filter(v => v)];
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
