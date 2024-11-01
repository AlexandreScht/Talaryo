import {
  candidateStrategiesResult,
  puppeteerCandidateProps,
  puppeteerCandidateResult,
  puppeteerCVProps,
  ScrappingSource,
} from '@/interfaces/scrapping';
import { ApiPuppeteer } from '@/libs/puppeteer';
import { GetElements, GetGoogleInfos } from '@/libs/scrapping';
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
    const { data: scrape, total } = result;
    return {
      scrapeResult: (scrape as candidateStrategiesResult[])?.filter(v => (current ? !!v?.currentCompany : v)),
      total,
    };
  }

  public async scrapeCV(url: string): Promise<{ links: string[]; total: number } | undefined> {
    const values: puppeteerCVProps = { url, strategy: this.cvStrategy, type: 'cv' };
    this.check(values);
    const result = await this.open(values);

    if (!result) {
      return undefined;
    }
    const { data: links, total } = result;
    return { links: (links as string[]).filter(v => v), total };
  }

  public cvStrategy(html: string): string[] {
    const data = load(html);
    const elements = GetElements(data);

    return elements.map(el => {
      const { link } = GetGoogleInfos(data, el);
      return link;
    });
  }
}
