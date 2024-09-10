import { contracts } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class LesJeudisStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.LesJeudisUri(values);
  }

  private LesJeudisUri({ jobName, homeWork, salary, page, contract, nightWork, loc, partTime }: searchForm) {
    if (loc?.letterCode === 'R' || ['CDD', 'interim', 'CDI'].includes(contract) || salary || nightWork) {
      return undefined;
    }
    let uri = 'https://lesjeudis.com/jobs';

    if (loc) {
      if (loc.letterCode === 'D') {
        uri += `/jobs-in-${this.locString(loc.label.toLowerCase())}`;
      } else {
        uri += `/jobs-in-${this.locString(loc?.parentZone?.department.label?.toLowerCase())}--${this.locString(loc.label.toLowerCase())}`;
      }
    }
    uri += `?title=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;

    const contractMap: Omit<Record<contracts, string>, 'CDD' | 'interim'> = {
      CDI: '&occupationType=FULL_TIME',
      alternance: '&occupationType=INTERNSHIP_APPRENTICESHIP',
      freelance: '&occupationType=CONTRACT_FREELANCE_SELF_EMPLOYED',
      stage: '&occupationType=INTERNSHIP_APPRENTICESHIP',
    };
    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    uri += `&occupationType=${partTime ? 'PART_TIME' : 'FULL_TIME'}`;

    if (homeWork != undefined) {
      uri += `&remote=${!!homeWork}`;
    }

    return `${uri}&page=${page}`;
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '+');
  }
  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }
}
