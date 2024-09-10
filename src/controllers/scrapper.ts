import { ServerException } from '@/exceptions';
import { site } from '@/interfaces';
import { ctx } from '@/interfaces/middleware';
import { puppeteerProps, WebsiteStrategy } from '@/interfaces/scrapping';
import JobTeaserStrategyFile from '@/strategys/JobTeaser';
import FranceTravailStrategyFile from '@/strategys/francTravail';
import HelloWorkStrategyFile from '@/strategys/helloWork';
import IndeedStrategyFile from '@/strategys/indeed';
import LesJeudisStrategyFile from '@/strategys/lesJeudis';
import LinkedInStrategyFile from '@/strategys/linkedin.ts';
import MonsterStrategyFile from '@/strategys/monster';
import TheJunglerStrategyFile from '@/strategys/theJungler';
import { ControllerMethods, ExpressHandler } from '@interfaces/controller';
import { Container } from 'typedi';
import { v7 as uuid } from 'uuid';
import { ApiPuppeteer } from './puppeteer';

export default class ScrapperControllerFile extends ApiPuppeteer implements ControllerMethods<ScrapperControllerFile> {
  private websiteStrategy: WebsiteStrategy;

  constructor() {
    super();
    this.websiteStrategy = {
      IndeedStrategy: Container.get(IndeedStrategyFile),
      FranceTravailStrategy: Container.get(FranceTravailStrategyFile),
      HelloWorkStrategy: Container.get(HelloWorkStrategyFile),
      JobTeaserStrategy: Container.get(JobTeaserStrategyFile),
      LesJeudisStrategy: Container.get(LesJeudisStrategyFile),
      LinkedInStrategy: Container.get(LinkedInStrategyFile),
      MonsterStrategy: Container.get(MonsterStrategyFile),
      TheJunglerStrategy: Container.get(TheJunglerStrategyFile),
    };
  }

  protected getJobs: ExpressHandler = async ({
    locals: {
      body: { websites, search },
    },
    res,
    next,
  }: ctx) => {
    try {
      res.send({ websites, search });
      // const authorizedSite: site[] = websites.map((site: site) => `${site}Strategy` in this.websiteStrategy);
      // const allURL = authorizedSite.reduce((acc: puppeteerProps[], site) => {
      //   const url: string = this[`${site}Strategy`].getURI(search);
      //   acc.push({ url, site });
      //   return acc;
      // }, []);

      // if (!allURL?.length) {
      //   throw new ServerException();
      // }

      // const jobId = uuid();
      // const JobsFinder = await this.open({ props: allURL, search }, jobId);

      // res.send({ res: JobsFinder });
    } catch (error) {
      next(error);
    }
  };
}
