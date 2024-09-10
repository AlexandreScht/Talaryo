import { contracts } from '@/interfaces';
import { searchForm } from '@/interfaces/scrapping';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class FranceTravailStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.FranceTravailUri(values);
  }

  private FranceTravailUri({ jobName, homeWork, salary, page, contract, nightWork, loc, partTime }: searchForm) {
    if (homeWork || contract === 'freelance') {
      return undefined;
    }
    const queryString = 'https://candidat.francetravail.fr/offres/recherche?';
    let uri = `${queryString}motsCles=${jobName ? this.uriString(jobName) : 'offre-emploi'}`;

    if (loc) {
      switch (loc.letterCode) {
        case 'R':
          uri += `&lieux=${loc.postal}R`;
          break;
        case 'D':
          uri += `&lieux=${loc.postal}D`;
          break;
        default:
          uri += `&lieux=${loc.postal}`;
          break;
      }
    }
    const contractMap: Omit<Record<contracts, string>, 'freelance'> = {
      CDI: '&typeContrat=CDI',
      alternance: '&natureOffre=E2&typeContrat=FS',
      stage: '&natureOffre=E2',
      CDD: '&typeContrat=CDD',
      interim: '&typeContrat=MIS',
    };
    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    uri += nightWork ? '&dureeHebdo=2&dureeHebdoMax=6&dureeHebdoMin=21' : partTime ? '&dureeHebdo=2' : '&dureeHebdo=1';

    if (salary) {
      uri += `&salaireMin=${salary.annual}&uniteSalaire=A`;
    }

    // version payante avec offresPartenaires=true mais tri des site deja utiliser
    return `${uri}&offresPartenaires=false&range=${(page - 1) * 20}-${page * 20}`;
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '-');
  }
}
