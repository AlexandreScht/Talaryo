export type platforms =
  | 'LinkedIn'
  | 'Viadeo'
  | 'Xing'
  | 'Batiactu'
  | 'Dribble'
  | 'Behance'
  | 'Culinary agents'
  | 'Symfony'
  | 'HEC'
  | 'Polytechnique'
  | 'Ferrandi'
  | 'UTC'
  | 'Centrale Supélec'
  | 'Centrale Lille'
  | 'Essec'
  | 'Neoma';

type platformLinkSearch =
  | 'https://fr.linkedin.com/'
  | 'https://viadeo.journaldunet.com/'
  | 'https://www.xing.com/'
  | 'https://reseau.batiactu.com/'
  | 'https://dribbble.com/'
  | 'https://culinaryagents.com/'
  | 'https://connect.symfony.com/'
  | 'https://www.hecalumni.fr/'
  | 'https://ax.polytechnique.org/'
  | 'https://www.ferrandialumni.fr/'
  | 'https://www.alumni.utc.fr/'
  | 'https://association.centralesupelec-alumni.com/cv/'
  | 'https://www.centraliens-lille.org/'
  | 'https://www.essecalumni.com/'
  | 'https://www.neoma-alumni.com/'
  | 'https://www.behance.net/';

interface candidateScrapingForm {
  platform: platforms;
  fn?: string[];
  industry?: string[];
  sector?: string[];
  time?: boolean;
  key?: string[];
  skill?: string[];
  Nindustry?: string[];
  Nskill?: string[];
  Nkey?: string[];
  zone?: boolean;
  loc?: string[];
}

interface cvScrapingForm {
  industry?: string[];
  Nindustry?: string[];
  Nskill?: string[];
  Nkey?: string[];
  skill?: string[];
  formation?: string[];
  sector?: string[];
  key?: string[];
  date?: Date;
  time: boolean;
  zone: boolean;
  loc?: string[];
  matching: Number;
  fn?: string[];
}

export interface ScrappingSource {
  url: string;
  platform: platforms;
  current: boolean;
}

interface candidateStrategiesResult {
  link: string;
  fullName: string;
  currentJob?: string;
  diplome?: string;
  currentCompany?: string;
  resume: string;
  img: string;
}

interface cvStrategiesResult {
  fullName: string;
  resume: string;
  currentJob?: string;
  matching: number;
  pdf: string;
  img: string;
}

interface puppeteerCandidateProps {
  url: string;
  strategy: (html: string) => candidateStrategiesResult[];
  type: 'reseaux';
}
interface puppeteerCVProps {
  url: string;
  strategy: (html: string) => string[];
  type: 'cv';
}

interface puppeteerResult {
  data?: candidateStrategiesResult[] | string[];
  pages?: number;
}

interface puppeteerCandidateResult {
  scrapeResult?: candidateStrategiesResult[];
  pages?: number;
}
interface puppeteerCVResult {
  cvLinks?: string[];
  pages?: number;
}
