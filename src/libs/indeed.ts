import { IndeedSearch } from '@interfaces/indeed';
import { contracts, graduation } from '@interfaces/index';
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
const uriString = (uri: string) => encodeURIComponent(uri).replace(/\s+/g, '+');

const graduationUri = (graduations: graduation[]): string => {
  const data: { [key in graduation]: { value: string; v2: string | null; rank: number } } = {
    Doctorat: { value: 'attr%286QC5F%', v2: null, rank: 1 },
    master: { value: 'attr%28EXSNN%', v2: '7CEXSNN%', rank: 2 },
    master1: { value: 'attr%28RNXWH%', v2: '7CRNXWH%', rank: 3 },
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
};

export function IndeedUri({ jobName, homeWork, salary, graduation, contract, nightWork, loc }: IndeedSearch) {
  const queryString = 'https://fr.indeed.com/emplois?';
  let uri = `${queryString}q=${jobName ? uriString(jobName) : 'offre+emploi'}`;

  if (salary) {
    uri += `${salary}%C2%A0000+%E2%82%AC`;
  }
  if (loc) {
    uri += `&l=${uriString(loc)}`;
  }

  const hasRequest = homeWork || graduation || nightWork || contract || loc;
  if (hasRequest) {
    uri += '&sc=0kf%3A';

    if (homeWork !== undefined) {
      uri += homeWork ? 'attr(DSQF7)' : 'attr(PAXZC)';
    }

    const contractMap: { [key in contracts]: string } = {
      CDI: 'jt(permanent)',
      fullTime: 'jt(fulltime)',
      apprentissage: 'jt(apprenticeship)',
      pro: 'jt(custom_1)',
      freelance: 'jt(subcontract)',
      stage: 'jt(internship)',
      CDD: 'jt(contract)',
      partTime: 'jt(parttime)',
      interim: 'jt(temporary)',
    };

    if (contract && contractMap[contract]) {
      uri += contractMap[contract];
    }

    if (nightWork) {
      uri += 'attr%28H3N5U%29';
    }

    if (graduation?.length) {
      uri += graduationUri(graduation);
    }

    uri += '%3B';
  }

  return uri;
}
