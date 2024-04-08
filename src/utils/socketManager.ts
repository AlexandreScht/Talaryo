// socketManager.ts

import { ServerException } from '@/exceptions';
import { eventsMap, userList } from '@/interfaces/user';
import socketIoMiddleware from '@/middlewares/socket';
import EventServiceFile from '@/services/event';
import { Server, Socket } from 'socket.io';
import Container from 'typedi';
import { logger } from './logger';

class SocketManager {
  private userList: userList[] = [];
  private eventMap: eventsMap = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initializeSocket();
  }

  private async initializeSocket() {
    const EventServices = Container.get(EventServiceFile);
    this.eventMap = await EventServices.getMissingEvent();
    this.io.on('connection', (socket: Socket) => {
      socket.on('newIo', ({ secret_key }) => {
        try {
          socketIoMiddleware({ socket, secret_key, list: this.userList }, ({ err, user }) => {
            if (user) {
              const sessionDouble = this.userList.find(u => u.userId === user.sessionId);
              if (sessionDouble && sessionDouble.refreshToken !== user.refreshToken) {
                this.ioSendTo({ socketId: sessionDouble.socketId }, 'session_double', { res: true });
                return;
              }
              this.userList.push({ refreshToken: user.refreshToken, socketId: socket.id, userId: user.sessionId, secret_key });
              this.sendUserListEvent(user.sessionId);
              return;
            }
            logger.error('Erreur de connexion :', err.message);
            socket.disconnect();
            return;
          });
        } catch (error) {
          logger.error('Erreur lors de la connexion :', error);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        this.userList = this.userList.filter(o => o.socketId !== socket.id);
      });
    });
  }

  private setUserListEvent(userId: number, eventName: string, eventData: Record<'res', any>): void {
    const eventKey = `${userId}.${eventName}`;
    const EventServices = Container.get(EventServiceFile);
    if (this.eventMap.has(eventKey)) {
      const existingEvent = this.eventMap.get(eventKey);
      if (existingEvent) {
        existingEvent.value = eventData;
        EventServices.updateMissingEvent(existingEvent.eventId, JSON.stringify(existingEvent.value));
        return;
      }
    }
    const newEvent = {
      userId,
      eventName,
      value: eventData,
      eventId: this.eventMap.size + 1,
    };
    this.eventMap.set(eventKey, newEvent);
    EventServices.createMissingEvent({ ...newEvent, value: JSON.stringify(newEvent.value) });
  }

  private sendUserListEvent(userId: number) {
    const evt = { found: false };
    this.eventMap.forEach((event, key) => {
      if (Number.parseInt(key.split('.')[0]) === userId) {
        this.eventMap.delete(key);
        this.ioSendTo({ userId: userId.toString() }, event.eventName, event.value);
        evt.found = true;
      }
    });
    if (evt.found) {
      const EventServices = Container.get(EventServiceFile);
      EventServices.delMissingEvent(userId);
    }
  }

  public ioSendTo(target: { socketId: string } | { userId: string }, eventName: string, eventData: Record<'res', any>) {
    if ('socketId' in target) {
      const sender = this.userList.find(u => u.socketId === target.socketId);
      if (!sender) {
        throw new ServerException(500, `L'utilisateur avec le socketId: ${target.socketId} est introuvable`);
      }
      return this.io.to(target.socketId).emit(eventName, { ...eventData, auth: { server_key: sender.secret_key, emitFrom: target.socketId } });
    }
    const sender = this.userList.find(u => u.userId === Number.parseInt(target.userId, 10));

    if (!sender) {
      return this.setUserListEvent(Number.parseInt(target.userId, 10), eventName, eventData);
    }
    this.io.to(sender.socketId).emit(eventName, { ...eventData, auth: { server_key: sender.secret_key, emitFrom: sender.socketId } });
  }
}

export const StoredSocket: { socketIo: SocketManager | undefined } = { socketIo: undefined };

const initializeSocket = (io: Server) => {
  const socketIo = new SocketManager(io);
  Object.defineProperty(StoredSocket, 'socketIo', {
    value: socketIo,
    writable: false,
    enumerable: true,
    configurable: false,
  });
};

export default initializeSocket;
