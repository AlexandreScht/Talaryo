import type { ScoresServicesJest } from '@/interfaces/jest';
import ScoreServiceFile from '@/services/scores';

import Container from 'typedi';

export default function scoresMockedService(): ScoresServicesJest {
  const ScoreService = Container.get(ScoreServiceFile);

  const getUserCurrentScores = jest.spyOn(ScoreService, 'getUserCurrentScores');
  const getUserRangeScores = jest.spyOn(ScoreService, 'getUserRangeScores');
  const getTotalMonthValues = jest.spyOn(ScoreService, 'getTotalMonthValues');
  const improveScore = jest.spyOn(ScoreService, 'improveScore');
  const decrementCv = jest.spyOn(ScoreService, 'decrementCv');

  return {
    getUserCurrentScores,
    getUserRangeScores,
    getTotalMonthValues,
    improveScore,
    decrementCv,
  };
}
