import {
  candidateStrategiesResult,
  puppeteerCandidateProps,
  puppeteerCandidateResult,
  puppeteerCVProps,
  ScrappingSource,
} from '@/interfaces/scrapping';
import { ApiPuppeteer } from '@/libs/puppeteer';
import { GetCvProps } from '@/libs/scrapping';
import { load } from 'cheerio';
import { Service } from 'typedi';

@Service()
export default class ScrapperServiceFile extends ApiPuppeteer {
  constructor() {
    super();
  }

  public async scrapeCandidate({ platform, url, current }: ScrappingSource): Promise<puppeteerCandidateResult | undefined> {
    const { default: strategy } = (await import(`./${platform}`)) as { default: (html: string) => candidateStrategiesResult[] };

    const values: puppeteerCandidateProps = { url, strategy, type: 'reseaux' };
    this.check(values);

    const result = await this.open(values);

    if (!result) {
      return undefined;
    }
    const { data: scrape, pages } = result;

    return {
      scrapeResult: (scrape as candidateStrategiesResult[])?.filter(v => (current ? !!v?.currentCompany : v)),
      pages,
    };
  }

  public async scrapeCV(url: string): Promise<{ links: string[]; pages: number } | undefined> {
    const values: puppeteerCVProps = { url, strategy: this.cvStrategy, type: 'cv' };
    this.check(values);
    const result = await this.open(values);
    if (!result) {
      return undefined;
    }
    const { data: links, pages } = result;
    return { links: (links as string[]).filter(v => v), pages };
  }

  public cvStrategy(html: string): string[] {
    const data = load(html);
    return GetCvProps(data).map(el => {
      return el.link;
    });
  }
}
