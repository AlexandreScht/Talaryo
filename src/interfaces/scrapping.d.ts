export interface searchValues {
  fn?: string;
  industry?: string;
}
export interface puppeteerProps {
  current?: boolean;
  url: string;
  props?: (value: string, searchValues: searchValues) => cheerioResult;
  searchValues?: searchValues;
  retryCount: number;
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

export type SourceFunction = {
  [key in sources]?: (html: string, searchValues: searchValues) => cheerioResult;
};
