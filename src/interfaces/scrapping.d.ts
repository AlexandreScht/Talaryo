export interface searchValues {
  fn?: string[];
  industry?: string[];
  sector?: string[];
  date?: number;
  current?: boolean;
  key?: string[];
  skill?: string[];
  Nindustry?: string[];
  Nskill?: string[];
  Nkey?: string[];
  formation?: string[];
  zone?: string[];
  matching?: number;
}
interface AiResult {
  fullName: string;
  resume: string;
  currentJob?: string;
  matching: number;
  pdf: string;
  img: string;
}

export interface puppeteerProps {
  current?: boolean;
  url: string;
  totalNumber?: number;
  props?: (value: string) => cheerioResult | AiResult[];
  type: 'cv' | 'reseaux';
}
export type sources =
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

export interface cheerioInfos {
  link: string;
  fullName: string;
  currentJob?: string;
  diplome?: string;
  currentCompany?: string;
  resume: string;
  img: string;
  favFolderId?: string;
}
export type cheerioResult = cheerioInfos[];

export interface scrappingResult {
  data: cheerioResult | string[];
  number: number;
}

export interface ScrapeInfosResult {
  scrape?: cheerioInfos[];
  number?: number;
}

export interface ScrapeCVResult {
  cv?: AiResult[];
  total?: number;
  number?: number;
}

export interface ScrappingSource {
  url: string;
  site: sources;
  current: boolean;
}

export type SourceFunction = {
  [key in sources]?: (html: string, searchValues: searchValues) => cheerioResult;
};
