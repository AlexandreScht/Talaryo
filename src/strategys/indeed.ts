import { searchForm } from '@/interfaces/scrapping';
import { contracts, graduations } from '@interfaces/index';
import IndeedServiceFile from '@services/indeed';
import { Container, Service } from 'typedi';
@Service()
export default class IndeedStrategyFile {
  private IndeedService: IndeedServiceFile;

  constructor() {
    this.IndeedService = Container.get(IndeedServiceFile);
  }

  protected getMainCheerio() {
    return this.IndeedService.IndeedMainPage;
  }

  public getUri(values: searchForm): string {
    return this.IndeedUri(values);
  }

  private IndeedUri({ jobName, homeWork, salary, page, graduations, rayon, contract, nightWork, loc, partTime }: searchForm) {
    const queryString = 'https://fr.indeed.com/emplois?';
    let uri = `${queryString}q=${jobName ? this.uriString(jobName) : 'offre+emploi'}`;

    if (salary) {
      uri += `+${salary.annual / 1000}%C2%A0000+€`;
    }

    if (loc) {
      switch (loc.letterCode) {
        case 'R':
          uri += `&l=${this.locString(loc.label)}`;
          break;
        case 'D':
          uri += `&l=${this.locString(loc.label)}`;
          break;
        default:
          uri += `&l=${this.locString(loc.label)}%20%28${loc.postal.toString().substring(0, 2)}%29`;
          break;
      }
    }

    const hasRequest = homeWork || graduations || nightWork || contract || loc;
    if (hasRequest) {
      uri += '&sc=0kf%3A';

      if (homeWork) {
        uri += homeWork === 'full' ? 'attr(DSQF7)' : 'attr(PAXZC)';
      }

      const contractMap: { [key in contracts]: string } = {
        CDI: 'jt(permanent)',
        alternance: 'jt(apprenticeship)',
        freelance: 'jt(subcontract)',
        stage: 'jt(internship)',
        CDD: 'jt(contract)',
        interim: 'jt(temporary)',
      };

      if (contract && contractMap[contract]) {
        uri += contractMap[contract];
      }

      if (partTime) {
        uri += 'jt(parttime)';
      }

      if (nightWork) {
        uri += 'attr%28H3N5U%29';
      }

      if (graduations?.length) {
        uri += this.graduationUri(graduations);
      }

      uri += '%3B';

      if (rayon) {
        uri += `&radius=${this.closetRayon(rayon)}`;
      }
    }

    return `${uri}&start=${(page - 1) * 10}`;
  }

  private uriString(uri: string): string {
    return encodeURIComponent(uri).replace(/\s+/g, '+');
  }

  private closetRayon(ray: number): number {
    const arr = [10, 25, 35, 50, 75, 100];
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

  private graduationUri(graduations: graduations[]): string {
    const data: { [key in graduations]: { value: string; v2: string | null; rank: number } } = {
      Doctorat: { value: 'attr%286QC5F%', v2: null, rank: 1 },
      master: { value: 'attr%28EXSNN%7CRNXWH%', v2: '7CEXSNN%7CRNXWH%', rank: 2 },
      licence: { value: 'attr%28HFDVW%', v2: '7CHFDVW%', rank: 4 },
      'bac+2': { value: 'attr%28UTPWG%', v2: '7CUTPWG%', rank: 5 },
      bac: { value: 'attr%28FCGTU%', v2: '7CFCGTU%', rank: 6 },
      'CAP/BEP': { value: 'attr%28YFQM7%', v2: '7CYFQM7%', rank: 7 },
    };
    graduations.sort((a, b) => data[a].rank - data[b].rank);

    if (graduations.length === 1) {
      return `${data[graduations[0]].value}29`;
    }

    const uri = graduations.reduce((acc, grad, index) => {
      return acc + (index === 0 ? data[grad].value : data[grad].v2);
    }, '');

    return `${uri}252COR%29`;
  }
}

/**
    => &sc=0kf%3A
    time: {
      fullTime: &sc=0kf%3Aattr(PAXZC)%3B (false)
      partTime: &sc=0kf%3Aattr(DSQF7)%3B (true)
    }
    salary: '${salary_number}%C2%A0000+%E2%82%AC'
    contracts: {
      CDI: &sc=0kf%3Ajt(permanent)%3B
      temp plein: &sc=0kf%3Ajt(fulltime)%3B
      apprentissage: &sc=0kf%3Ajt(apprenticeship)%3B
      contrat pro: &sc=0kf%3Ajt(custom_1)%3B
      freelance: &sc=0kf%3Ajt(subcontract)%3B
      stage: &sc=0kf%3Ajt(internship)%3B
      CDD: &sc=0kf%3Ajt(contract)%3B
      Temp partiel: &sc=0kf%3Ajt(parttime)%3B
      Intérim: &sc=0kf%3Ajt(temporary)%3B
    }
    nightWork: attr%28H3N5U%29
    graduation: {
      Doctorat: attr%286QC5F%
      master1: attr%28RNXWH%
      master1 (v2): 7CRNXWH%
      master: attr%28EXSNN%
      master(v2): 7CEXSNN%
      licence: attr%28HFDVW%
      licence(v2): 7CHFDVW%
      bac +2: attr%28UTPWG%
      bac +2(v2): 7CUTPWG%
      bac: attr%28FCGTU%
      bac (v2): 7CFCGTU%
      CAP/BEP: attr%28YFQM7%
      CAP/BEP (v2): 7CYFQM7%
    } => { alone: 29, multiple: 252COR%29}
    => %3B
*/
