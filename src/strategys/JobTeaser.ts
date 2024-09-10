import { contracts, graduations } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class JobTeaserStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.JobTeaserUri(values);
  }

  private JobTeaserUri({ jobName, homeWork, salary, page, graduations, rayon, contract, nightWork, loc, partTime }: searchForm) {
    if (salary || partTime || nightWork || ['freelance', 'interim'].includes(contract)) {
      return undefined;
    }
    const queryString = 'https://www.jobteaser.com/fr/job-offers?locale=fr';
    let uri = `${queryString}&q=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;

    if (loc) {
      switch (loc.letterCode) {
        case 'R':
          uri += `&lat=${loc.lat}&lng=${loc.lng}&location=France%3A%3A${this.locString(loc.label)}%3A%3A`;
          break;
        case 'D':
          uri += `&lat=${loc.lat}&lng=${loc.lng}&location=France%3A%3A${this.locString(loc?.parentZone.region.label)}%3A%3A${this.locString(
            loc.label,
          )}%3A%3A`;
          break;
        default:
          uri += `&lat=${loc.lat}&lng=${loc.lng}&location=France%3A%3A${this.locString(loc?.parentZone.region.label)}%3A%3A${this.locString(
            loc.label,
          )}%3A%3A${this.locString(loc.label)}%3A%3A`;
          break;
      }
    }
    const contractMap: Omit<Record<contracts, string>, 'freelance' | 'interim'> = {
      CDI: '&contract=cdi',
      alternance: '&contract=alternating',
      stage: '&contract=internship',
      CDD: '&contract=cdd',
    };
    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    if (graduations?.length) {
      uri += this.graduationUri(graduations);
    }

    if (rayon) {
      uri += `&radius=${this.closetRayon(rayon)}`;
    }

    if (homeWork) {
      uri += homeWork === 'full' ? '&remote_types=remote_full' : '&remote_types=remote_partial';
    }

    return `${uri}&page=${page}`;
  }

  private closetRayon(ray: number): number {
    const arr = [5, 10, 20, 30, 50];
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

  private graduationUri(graduations: graduations[]): string {
    const levelMapping = {
      bac: 1,
      'bac+2': 2,
      licence: 3,
      master: 4,
      doctorat: 5,
    };

    const uniqueLevels = new Set();
    graduations.forEach(level => {
      if (levelMapping[level] !== undefined) {
        uniqueLevels.add(levelMapping[level]);
      }
    });

    const sortedLevels = [...uniqueLevels].sort((a: any, b: any) => a - b);
    return sortedLevels.map(level => `&study_levels=${level}`).join('');
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '+');
  }
  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }
}
