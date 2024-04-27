import { ServicesError } from '@/exceptions';
import { eventList, eventsMap } from '@/interfaces/user';
import { EventModel } from '@/models/event';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class EventServiceFile {
  get getModel(): Knex<any, any[]> {
    return EventModel.knex();
  }

  public async createMissingEvent(eventData: eventList, eventId: string): Promise<boolean> {
    try {
      const insert = await EventModel.query().insert({ ...eventData, eventId });
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
      const events = await EventModel.query().select('userId', 'eventName', 'value', 'text', 'date', 'eventId').where({ send: false });

      return new Map(
        events.map(event => {
          const { userId, eventId, eventName, date, text } = event;
          const key = `${userId}.${eventId}`;
          return [key, { userId, eventName, value: JSON.parse(event.value), date, text }];
        }),
      );
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async getUserEvent(userId: number): Promise<EventModel[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const events = await EventModel.query()
        .select('date', 'text')
        .where({ userId, send: true })
        .andWhere('createdAt', '>', oneYearAgo.toISOString())
        .orderBy('createdAt', 'desc');
      return events || [];
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async setEventSendToUser(userId: number) {
    try {
      await EventModel.query().where({ userId }).patch({ send: true });
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default EventServiceFile;
