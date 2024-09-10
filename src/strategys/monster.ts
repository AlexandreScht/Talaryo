import { contracts } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class MonsterStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.MonsterUri(values);
  }
  private MonsterUri({ jobName, homeWork, salary, page, contract, rayon, nightWork, loc, partTime }: searchForm) {
    if (nightWork || salary) {
      return undefined;
    }
    const queryString = 'https://www.monster.fr/emploi/recherche?';
    let uri = `${queryString}q=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;

    if (loc) {
      if (loc.letterCode === 'C') {
        uri += `&where=${this.locString(loc.label)}%2C+${this.locString(loc?.parentZone.region.label)}`;
      } else {
        uri += `&where=${this.locString(loc.label)}`;
      }
    }

    if (homeWork) {
      uri += '&et=REMOTE';
    }

    const contractMap: { [key in contracts]: string } = {
      CDI: '&et=OTHER',
      alternance: '&et=INTERN',
      freelance: '&et=CONTRACT',
      stage: '&et=INTERN',
      CDD: '&et=TEMP',
      interim: '&et=TEMP',
    };
    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    uri += partTime ? '&et=PART_TIME' : '&et=FULL_TIME';

    if (rayon) {
      uri += `&rd=${this.closetRayon(rayon)}`;
    }

    return `${uri}&page=${page}`;
  }

  private closetRayon(ray: number): number {
    const arr = [5, 10, 20, 50, 100];
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

  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '+');
  }
}
