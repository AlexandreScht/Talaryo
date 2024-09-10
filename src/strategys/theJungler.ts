import { contracts, graduations } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class TheJunglerStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.TheJunglerUri(values);
  }
  private TheJunglerUri({ jobName, homeWork, salary, graduations, page, contract, rayon, nightWork, loc, partTime }: searchForm) {
    if (nightWork || contract === 'interim') {
      return undefined;
    }
    const queryString = 'https://www.welcometothejungle.com/fr/jobs?';
    let uri = `${queryString}query=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;
    uri += `&page=${page}`;

    if (loc) {
      switch (loc.letterCode) {
        case 'R':
          uri += `&aroundQuery=${this.locString(
            loc.label,
          )}%2C%20France&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Boffices.state%5D%5B%5D=${this.locString(loc.label)}`;
          break;
        case 'D':
          uri += `&aroundQuery=${this.locString(
            loc.label,
          )}%2C%20France&refinementList%5Boffices.country_code%5D%5B%5D=FR&refinementList%5Boffices.district%5D%5B%5D=${this.locString(
            loc.label,
          )}&refinementList%5Boffices.state%5D%5B%5D=${this.locString(loc?.parentZone.region.label)}`;
          break;
        default:
          uri += `&aroundQuery=${this.locString(loc.label)}%2C%20France&aroundLatLng=${loc.lat}%2C${loc.lng}`;
      }
    } else {
      uri += '&aroundQuery=France';
    }
    if (homeWork) {
      switch (homeWork) {
        case 'full':
          uri += '&refinementList%5Bremote%5D%5B%5D=fulltime';
          break;
        case 'low':
          uri += '&refinementList%5Bremote%5D%5B%5D=partial';
          break;
        case 'medium':
          uri += '&refinementList%5Bremote%5D%5B%5D=punctual';
          break;
      }
    }

    const contractMap: Omit<Record<contracts, string>, 'interim'> = {
      CDI: 'full_time',
      alternance: 'apprenticeship',
      freelance: 'freelance',
      stage: 'internship',
      CDD: 'temporary',
    };
    if (contract && contractMap[contract]) {
      uri += `&refinementList%5Bcontract_type%5D%5B%5D=${contractMap[contract]}`;
    }

    if (partTime) {
      uri += '&refinementList%5Bcontract_type%5D%5B%5D=part_time';
    }

    if (graduations?.length) {
      uri += this.graduationUri(graduations);
    }

    if (salary) {
      uri += `&refinementList%5Bsalary_yearly_minimum%5D%5B%5D=${salary.annual}%2B&refinementList%5Bsalary_currency%5D%5B%5D=EUR`;
    }

    if (rayon) {
      uri += `&aroundRadius=${this.closetRayon(rayon)}`;
    }

    return uri;
  }

  private closetRayon(ray: number): number {
    const arr = [1, 5, 10, 20, 50, 100];
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
      'CAP/BEP': '&refinementList%5Beducation_level%5D%5B%5D=cap&refinementList%5Beducation_level%5D%5B%5D=bep',
      bac: '&refinementList%5Beducation_level%5D%5B%5D=bac',
      'bac+2': '&refinementList%5Beducation_level%5D%5B%5D=bac_1&refinementList%5Beducation_level%5D%5B%5D=bac_2',
      licence: '&refinementList%5Beducation_level%5D%5B%5D=bac_3',
      master: '&refinementList%5Beducation_level%5D%5B%5D=bac_4&refinementList%5Beducation_level%5D%5B%5D=bac_5',
      doctorat: '&refinementList%5Beducation_level%5D%5B%5D=phd',
    };

    const uniqueLevels = new Set();
    graduations.forEach(level => {
      if (levelMapping[level] !== undefined) {
        uniqueLevels.add(levelMapping[level]);
      }
    });

    return [...uniqueLevels].map(level => level).join('');
  }

  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri);
  }
}
