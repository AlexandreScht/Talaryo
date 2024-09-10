// import { StoredQueue } from '@/libs/queueProcess';
import { logger } from '@utils/logger';
import type Queue from 'bull';
import type { Page } from 'puppeteer';
import { executablePath } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { InvalidArgumentError, PuppeteerError } from '../exceptions';
import type { puppeteerQueue, puppeteerQueuing, puppeteerScrapped, scrappingResult } from '../interfaces/scrapping';

export class ApiPuppeteer {
  private browser: Cluster | null = null;
  private queue: Queue.Queue<any>;

  constructor() {
    this.queue = StoredQueue.process;
    if (this.queue) {
      this.queue.process(10, this.processQueue.bind(this));
    }
  }

  private check(data: puppeteerQueue) {
    if (!(data?.props && Array.isArray(data.props))) {
      throw new InvalidArgumentError('props is a required property and must have a site and url keys.');
    }
    data.props.map(v => {
      if (!(typeof v?.url === 'string' && typeof v.site === 'string')) {
        throw new InvalidArgumentError('value is a required property and must be an object with jobName key.');
      }
    });
    if (!(data?.search && typeof data?.search?.jobName === 'string')) {
      throw new InvalidArgumentError('search is a required property and must have a site and url keys.');
    }

    logger.info(`---------------
    puppeteer check successfully
    ---------------`);
  }

  private async init(values: puppeteerQueue): Promise<void> {
    this.check(values);
    try {
      puppeteer.use(StealthPlugin());
      this.browser = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 8,
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
      throw new PuppeteerError();
    }
  }

  private async configurePage(page: Page) {
    if (page) {
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
      return page;
    }
    throw new PuppeteerError('Failed to configure page');
  }

  private async getBodyContent({ page, data }: { page: Page; data: puppeteerQueuing }): Promise<puppeteerScrapped | undefined> {
    try {
      const {
        props: { url, site },
        search,
      } = data;
      const response = await page.goto(url);
      if (response && response.status() === 200) {
        const responseBody = await response.text();
        if (!responseBody) {
          throw new Error();
        }
        return { content: responseBody, site, search };
      }
      throw new PuppeteerError('Failed to load page');
    } catch (error) {
      logger.error(`Puppeteer scrapping Error: ${error.message}`);
      return undefined;
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  private async processQueue(job: Queue.Job<puppeteerQueue>, done: Queue.DoneCallback) {
    try {
      const {
        data: { search, props },
      } = job;

      const result: puppeteerScrapped[] = [];

      await this.browser!.task(async ({ page, data }: { page: Page; data: puppeteerQueuing }) => {
        try {
          const modifiedPage = await this.configurePage(page);
          const res = await this.getBodyContent({ page: modifiedPage, data });
          result.push(res);
        } catch (error) {
          logger.error(`Error on scrapping site: ${data.props.site}`);
          console.log(error);
        }
      });

      props.forEach(option => this.browser.queue({ data: option, search }));

      if (!result.length) {
        throw new PuppeteerError('Failed to get any content');
      }
      done(null, result);
    } catch (error) {
      logger.error(`Queue processing error: ${error}`);
      done(error);
    }
  }

  protected async open(values: puppeteerQueue, jobId: string): Promise<[boolean, scrappingResult[]?]> {
    try {
      if (!this.browser) {
        await this.init(values);
      }

      //* option [priority, attempts, repeat] on this.queue.add
      await this.queue.add(values, { removeOnComplete: true, removeOnFail: true, jobId });

      //! create delete func fo waiting job

      //! create cancel func fo active job

      return await new Promise((resolve, reject) => {
        this.queue.on('completed', (job, result) => {
          logger.info(`Job ${job.id} completed with success`);
          resolve(result);
        });

        this.queue.on('active', (job, task) => {
          logger.info(`Job ${job.id} started`);
          const cond = false;
          if (cond) {
            task.cancel();
          }
        });

        this.queue.on('failed', (job, err) => {
          logger.error(`Job ${job.id} failed with error ${err}`);
          reject(undefined);
        });

        this.queue.on('drained', async () => {
          await this.close();
        });

        this.queue.on('waiting', async jobId => {
          const waitingJobs = await this.queue.getWaiting();
          const jobIndex = waitingJobs.findIndex(j => j.id === jobId);
          if (jobIndex !== -1) {
            logger.info(`Job ${jobId} is in position ${jobIndex + 1} in the queue`);
          }
        });
      });
    } catch (error) {
      logger.error(`Error on open: ${error}`);
      return undefined;
    } finally {
      await this.close();
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
