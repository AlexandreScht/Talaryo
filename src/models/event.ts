import type { event } from '@interfaces/models';
import { Model, ModelObject } from 'objection';

export class EventModel extends Model implements event {
  id: number;
  userId: number;
  eventName: string;
  eventId: string;
  send: boolean;
  value?: string;
  text?: string;
  date: string;

  static tableName = 'event';
  static idColumn = 'id';
}

export type ScoreShape = ModelObject<EventModel>;
