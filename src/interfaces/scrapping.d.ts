import type FranceTravailStrategyFile from '@/strategys/francTravail';
import type HelloWorkStrategyFile from '@/strategys/helloWork';
import type IndeedStrategyFile from '@/strategys/indeed';
import type JobTeaserStrategyFile from '@/strategys/JobTeaser';
import type LesJeudisStrategyFile from '@/strategys/lesJeudis';
import type LinkedInStrategyFile from '@/strategys/linkedin.ts';
import type MonsterStrategyFile from '@/strategys/monster';
import type TheJunglerStrategyFile from '@/strategys/theJungler';
import Container from 'typedi';
import type { contracts, graduations, homeWork, salary, site } from '.';

export interface puppeteerProps {
  url: string;
  site: site;
}

interface localization {
  label: string;
  letterCode: 'C' | 'D' | 'R';
  postal: number;
  code: number;
  lng: number;
  lat: number;
  parentZone?: {
    region: {
      label: string;
      postal: number;
    };
    department?: {
      label: string;
      postal: number;
    };
  };
}

interface searchForm {
  jobName: string;
  homeWork?: homeWork[];
  rayon?: number;
  salary?: salary;
  page: number;
  experience?: number;
  partTime?: boolean;
  contract?: contracts[];
  nightWork?: boolean;
  graduations?: graduations[];
  loc?: localization;
}
interface puppeteerQueue {
  props: puppeteerProps[];
  search: searchForm;
}
interface puppeteerQueuing {
  props: puppeteerProps;
  search: searchForm;
}

interface puppeteerScrapped {
  content: string;
  site: site;
  search: searchForm;
}

export interface cheerioResult {
  link: string;
  jobName: string;
  company?: string;
  workPlace?: string;
  loc?: string;
  salary?: salary;
  others?: string[];
}

interface scrappingResult {
  result?: string;
  id: site | number;
}

interface WebsiteStrategy {
  IndeedStrategy: ReturnType<typeof Container.get<IndeedStrategyFile>>;
  FranceTravailStrategy: ReturnType<typeof Container.get<FranceTravailStrategyFile>>;
  HelloWorkStrategy: ReturnType<typeof Container.get<HelloWorkStrategyFile>>;
  JobTeaserStrategy: ReturnType<typeof Container.get<JobTeaserStrategyFile>>;
  LesJeudisStrategy: ReturnType<typeof Container.get<LesJeudisStrategyFile>>;
  LinkedInStrategy: ReturnType<typeof Container.get<LinkedInStrategyFile>>;
  MonsterStrategy: ReturnType<typeof Container.get<MonsterStrategyFile>>;
  TheJunglerStrategy: ReturnType<typeof Container.get<TheJunglerStrategyFile>>;
}
