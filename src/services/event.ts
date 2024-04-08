import { ServicesError } from '@/exceptions';
import { eventsMap } from '@/interfaces/user';
import { EventModel } from '@/models/event';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class EventServiceFile {
  get getModel(): Knex<any, any[]> {
    return EventModel.knex();
  }

  public async createMissingEvent({
    userId,
    eventName,
    value,
    eventId,
  }: {
    userId: number;
    eventName: string;
    value: string;
    eventId: number;
  }): Promise<boolean> {
    try {
      const insert = await EventModel.query().insert({ userId, eventName, index: eventId, value });
      return !!insert;
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        return false;
      }
      throw new ServicesError();
    }
  }

  public async updateMissingEvent(eventId: number, value: string): Promise<boolean> {
    try {
      const insert = await EventModel.query().findById(eventId).patch({ value });
      return !!insert;
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        return false;
      }
      throw new ServicesError();
    }
  }

  public async getMissingEvent(): Promise<eventsMap> {
    try {
      const events = await EventModel.query().select('*').orderBy('index', 'asc');
      return new Map(
        events.map(event => {
          const key = `${event.userId}.${event.eventName}`;
          return [key, { userId: event.userId, eventName: event.eventName, value: JSON.parse(event.value), eventId: event.index }];
        }),
      );
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async delMissingEvent(userId: number) {
    try {
      await EventModel.query().where({ userId }).del();
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default EventServiceFile;
