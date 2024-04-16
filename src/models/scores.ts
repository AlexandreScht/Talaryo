import type { scores } from '@interfaces/models';
import { Model, ModelObject } from 'objection';

export class ScoreModel extends Model implements scores {
  id?: number;
  userId: number;
  year: number;
  month: number;
  day: number;
  searches: number;
  profils: number;
  mails: number;
  totalSearches?: number;
  totalMails?: number;

  static tableName = 'scores';
  static idColumn = 'id';
}

export type ScoreShape = ModelObject<ScoreModel>;
