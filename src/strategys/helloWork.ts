import { contracts } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class HelloWorkStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.HelloWorkUri(values);
  }
  private HelloWorkUri({ jobName, homeWork, salary, page, contract, nightWork, loc, partTime }: searchForm) {
    if (nightWork || partTime) {
      return undefined;
    }
    const queryString = 'https://www.hellowork.com/fr-fr/emploi/recherche.html?';
    let uri = `${queryString}k=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;

    if (loc) {
      switch (loc.letterCode) {
        case 'R':
          uri += `&l=${this.locString(loc.label)}&l_autocomplete=http%3A%2F%2Fwww.rj.com%2Fcommun%2Flocalite%2Fregion%2F${loc.postal}&d=all`;
          break;
        case 'D':
          uri += `&l=${this.locString(loc.label)}&l_autocomplete=http%3A%2F%2Fwww.rj.com%2Fcommun%2Flocalite%2Fdepartement%2F${loc.postal}&d=all`;
          break;
        default:
          uri += `&l=${this.locString(loc.label)}+${loc.postal}&l_autocomplete=http%3A%2F%2Fwww.rj.com%2Fcommun%2Flocalite%2Fcommune%2F${
            loc.code
          }&d=all`;
          break;
      }
    }
    const contractMap: { [key in contracts]: string } = {
      CDI: '&c=CDI',
      alternance: '&c=Alternance',
      freelance: '&c=Independant',
      stage: '&c=Stage',
      CDD: '&c=CDD',
      interim: '&c=Travail_temp',
    };
    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    if (homeWork !== undefined) {
      switch (homeWork) {
        case 'full':
          uri += '&t=Complet';
          break;
        case 'medium':
          uri += '&t=Complet&t=Partiel';
          break;
        case 'low':
          uri += '&t=Complet&t=Partiel&t=Occasionnel';
          break;
        default:
          uri += '&t=Pas_teletravail';
          break;
      }
    }

    if (salary) {
      uri += `&msa=${salary.annual}&`;
    }

    return `${uri}&p=${page}`;
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '+');
  }

  private locString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }
}
