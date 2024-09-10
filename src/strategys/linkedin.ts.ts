import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class LinkedInStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.LinkedInUri(values);
  }

  private LinkedInUri({ jobName, homeWork, salary, page, contract, rayon, nightWork, loc, partTime }: searchForm) {
    if (['CDD', 'interim', 'freelance'].includes(contract) || salary || nightWork) {
      return undefined;
    }
    let uri = 'https://www.linkedin.com/jobs/search/?';
    uri += jobName ? `keywords=${this.uriString(jobName)}` : 'keywords=offre%20emploi';

    if (loc) {
      if (loc.letterCode === 'R') {
        uri += `&location=${this.locString(loc.label)}%2C%20France`;
      } else {
        uri += `&location=${this.locString(loc.label)}%2C%20${this.locString(loc?.parentZone.region.label)}%2C%20France`;
      }
    }

    if (contract) {
      if (contract === 'CDI') {
        uri += partTime ? '&f_JT=P%2CC' : '&f_JT=F%2CC';
      } else {
        uri += partTime ? '&f_JT=P%2CI' : '&f_JT=I';
      }
    }

    if (homeWork !== undefined) {
      if (homeWork === 'full') {
        uri += '&f_WT=2';
      } else if (homeWork === 'low' || homeWork === 'medium') {
        uri += '&f_WT=3';
      } else {
        uri += '&f_WT=1';
      }
    }

    if (loc.letterCode === 'C' && rayon) {
      uri += `&distance=${this.closetRayon(Math.round(rayon / 1.6))}`;
    }

    return `${uri}&start=${(page - 1) * 25}`;
  }

  private closetRayon(ray: number): number {
    const arr = [0, 5, 10, 25, 50, 100];
    arr.sort((a, b) => a - b);
    if (ray < arr[0]) {
      return arr[0];
    }

    for (let i = 0; i < arr.length; i++) {
      if (ray === arr[i]) {
        return arr[i];
      } else if (ray < arr[i]) {
        if (i > 0 && ray > arr[i - 1]) {
          if (ray + 5 >= arr[i]) {
            return arr[i];
          } else {
            return arr[i - 1];
          }
        }
        return arr[i];
      }
    }

    return arr[arr.length - 1];
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri);
  }
  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }
}
