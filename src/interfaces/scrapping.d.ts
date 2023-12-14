export interface puppeteerProps {
  current?: boolean;
  url: string;
  props?: [(value: string) => cheerioResult, string];
  retryCount: number;
}
export type sources =
  | 'LinkedIn'
  | 'Viadeo'
  | 'Xing'
  | 'Skiller'
  | 'PmeBTP'
  | 'Batiactu'
  | 'Dribble'
  | 'Behance'
  | 'Culinary agents'
  | 'Dogfinance'
  | 'Symfony'
  | 'HEC'
  | 'Polytechnique'
  | 'Ferrandi'
  | 'AIX & Polytech marseille'
  | 'UTC'
  | 'Centrale Supélec'
  | 'Centrale Lille'
  | 'Essec'
  | 'Edhec'
  | 'Neoma'
  | 'ESTP'
  | 'Mines Ales'
  | 'AIVP'
  | 'ENSG'
  | 'ICAM'
  | 'Skema';

export interface cheerioInfos {
  link: string;
  fullName: string;
  currentJob: string;
  currentCompany: string;
  desc: string;
  img: string;
  favFolderId?: string;
  platform: string;
}
export type cheerioResult = cheerioInfos[];

export interface scrappingResult {
  data: cheerioResult;
  number?: number;
  current: boolean;
}

export interface ScrapeInfosResult {
  scrape?: cheerioInfos[];
  number?: number;
}

export interface ScrappingSource {
  url: string;
  site: sources;
  current: boolean;
}
