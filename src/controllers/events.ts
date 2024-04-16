import auth from '@/middlewares/auth';
import EventServiceFile from '@/services/event';
import mw from '@middlewares/mw';
import { Container } from 'typedi';

const EventController = ({ app }) => {
  const EventServices = Container.get(EventServiceFile);
  app.get(
    '/user-events',
    mw([
      auth(),
      async ({ session: { sessionId }, res, next }) => {
        try {
          const events = await EventServices.getUserEvent(sessionId);
          console.log(events);

          res.status(201).send({ res: events });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};

export default EventController;
