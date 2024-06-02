import { IndeedController } from '@controllers/indeed';
import { contracts } from '@interfaces/index';
import 'reflect-metadata';
import Container from 'typedi';

const IndeedSearch = {
  jobName: 'développeur web',
  homeWork: undefined,
  salary: 18,
  contract: 'CDI' as contracts,
  nightWork: false,
  graduation: [],
  loc: 'ile de france',
};

console.log('start');
(async () => {
  console.log('start');
  try {
    const Indeed = Container.get(IndeedController);
    const [{ result }] = await Indeed.getJobs(IndeedSearch);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
