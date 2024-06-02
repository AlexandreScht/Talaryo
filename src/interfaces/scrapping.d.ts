export interface puppeteerProps {
  url: string;
  cheerio: (html: string) => cheerioResult[];
  id: number;
}

export interface cheerioResult {
  link: string;
  jobName: string;
  company?: string;
  domicile?: string;
  currentCompany?: string;
  loc?: string;
  salary?: string;
  others?: string[];
}

interface scrappingResult {
  id: number;
  result: cheerioResult[];
}
