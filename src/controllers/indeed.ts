import { ServerException } from '@exceptions';
import { IndeedSearch } from '@interfaces/indeed';
import { cheerioResult } from '@interfaces/scrapping';
import { IndeedUri } from '@libs/indeed';
import ScrapperServiceFile from '@services/scrapping';
import { Container, Service } from 'typedi';
import { ApiPuppeteer } from './puppeteer';

@Service()
export class IndeedController extends ApiPuppeteer {
  private IndeedService: (content: string) => cheerioResult[];

  constructor() {
    super();
    const scrapperService = Container.get(ScrapperServiceFile);
    this.IndeedService = scrapperService.Indeed;
  }

  public async getJobs(values: IndeedSearch) {
    const url = IndeedUri(values);
    const [error, result] = await this.open([{ url, id: 1, cheerio: this.IndeedService }]);
    if (error) {
      throw new ServerException();
    }
    return result;
  }
}
