import type { ScraperServicesJest } from '@/interfaces/jest';
import ScrapperServiceFile from '@/strategys/scrapper';

import Container from 'typedi';

export default function scraperMockedService(): ScraperServicesJest {
  const ScrapperService = Container.get(ScrapperServiceFile);

  const scrapeCV = jest.spyOn(ScrapperService, 'scrapeCV');
  const scrapeCandidate = jest.spyOn(ScrapperService, 'scrapeCandidate');
  const cvStrategy = jest.spyOn(ScrapperService, 'cvStrategy');

  return {
    scrapeCV,
    scrapeCandidate,
    cvStrategy,
  };
}
