import type { event } from '@interfaces/models';
import { Model, ModelObject } from 'objection';

export class EventModel extends Model implements event {
  index: number;
  userId: number;
  eventName: string;
  value: string;

  static tableName = 'event';
  static idColumn = 'index';
}

export type ScoreShape = ModelObject<EventModel>;
