import { ServerException } from '@/exceptions';
import { ScrapeInfosResult, ScrappingSource, cheerioInfos, cheerioResult, puppeteerProps } from '@/interfaces/scrapping';
import { ApiPuppeteer } from '@utils/puppeteer';
import { load } from 'cheerio';
import { Service } from 'typedi';

@Service()
export class ScrapperServiceFile extends ApiPuppeteer {
  private shuffleArray(v: cheerioInfos[][]): cheerioInfos[] {
    const shuffleArr = [].concat(...v);
    for (let i = shuffleArr.length - 1; i > 0; i--) {
      const mixed = Math.floor(Math.random() * (i + 1));
      [shuffleArr[i], shuffleArr[mixed]] = [shuffleArr[mixed], shuffleArr[i]];
    }

    return shuffleArr;
  }

  private getFn(name: string): [(value: string) => cheerioResult, string] {
    const functionName = {
      LinkedIn: [this.LinkedIn, 'https://www.google.com/search'],
    };
    return functionName[name];
  }

  public async scrape(data: ScrappingSource[]): Promise<ScrapeInfosResult> {
    const values: puppeteerProps[] = data.map(v => ({ ...v, props: this.getFn(v.site), retryCount: 0 }));
    this.check(values);
    const [error, success] = await this.open(values);
    if (error) {
      throw new ServerException();
    }
    const number = success
      .filter(o => o.number)
      .reduce((acc, n) => {
        return (acc += n.number);
      }, 0);

    const result: cheerioInfos[][] = success
      .filter(o => o.data)
      .map(obj => {
        if (!obj.current) {
          return obj.data;
        }
        return obj.data.filter(v => v.currentCompany);
      });

    if (result.length === 1) {
      return { scrape: result[0], number };
    }

    return { scrape: this.shuffleArray(result), number };
  }

  private LinkedIn(html: string): cheerioResult {
    //? ----- linkedIn logic -----
    const $ = load(html);

    const linkedIn: cheerioResult = [];

    const platform = $('div.N54PNb.BToiNc.cvP2Ce').find('img.XNo5Ab').attr('src');

    const elements = $('div.N54PNb.BToiNc.cvP2Ce');
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const link = $(element).find('a[jsname="UWckNb"]').attr('href');
      const title = $(element).find('h3.LC20lb.MBeuO.DKV0Md').text().split(' - ');
      const chip = [];
      const chipWrapper = $(element).find('div.lhLbod.gEBHYd');
      if (chipWrapper) {
        chipWrapper.find('span').each((_, elem) => {
          const chipText = $(elem).text();
          if (chipText !== ' · ') {
            chip.push(chipText);
          }
        });
      }
      const desc = $(element).find('div.VwiC3b.yXK7lf.lyLwlc.yDYNvb.W8l4ac.lEBKkf').text();
      const fullName = title?.length > 0 ? title[0].toString().trim() : undefined;
      const currentJob = chip?.length > 2 ? chip[1].toString().trim() : title?.length > 1 ? title[1].toString().trim() : undefined;
      const currentCompany = title?.length > 2 ? title[2].toString().trim() : chip?.length > 1 ? chip[chip.length - 1].toString().trim() : undefined;
      linkedIn.push({ platform, link, img: null, fullName, currentJob, currentCompany, desc: desc?.trim() });
    }

    return linkedIn;
  }
}

export default ScrapperServiceFile;
