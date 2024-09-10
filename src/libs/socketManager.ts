// socketManager.ts

import { ServerException } from '@/exceptions';
import { socketList } from '@interfaces/webSocket';
import socketIoMiddleware from '@middlewares/socket';
import { logger } from '@utils/logger';
import { Server, Socket } from 'socket.io';

class SocketManager {
  private socketList: socketList[] = [];
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initializeSocket();
  }

  private async initializeSocket() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('ioLogged', ({ secret_key }) => {
        try {
          socketIoMiddleware({ socket, secret_key, list: this.socketList }, async ({ err, result }) => {
            if (err) {
              logger.error('Erreur lors de la connexion socket-Io :', err);
              return;
            }
            const { user, session_double } = result;
            if (session_double) {
              this.ioSendTo({ socketId: session_double.socketId }, 'session_double', undefined);
            }
            this.socketList.push({ refreshToken: user.refreshToken, socketId: socket.id, userId: user.sessionId, secret_key });
            // this.sendUserListEvent(user.sessionId);
          });
        } catch (error) {}
      });

      socket.on('disconnect', async () => {
        this.socketList = this.socketList.filter(o => o.socketId !== socket.id);
      });
    });
  }

  public ioSendTo(target: { socketId: string } | { userId: string }, eventName: string, eventData: any) {
    if ('socketId' in target) {
      const sender = this.socketList.find(u => u.socketId === target.socketId);
      if (!sender) {
        throw new ServerException(500, `L'utilisateur avec le socketId: ${target.socketId} est introuvable`);
      }
      return this.io.to(target.socketId).emit(eventName, { ...eventData, auth: { server_key: sender.secret_key, emitFrom: target.socketId } });
    }
    const sender = this.socketList.find(u => u.userId === Number.parseInt(target.userId, 10));

    if (!sender) {
      // stock userid
      return;
    }
    this.io.to(sender.socketId).emit(eventName, { ...eventData, auth: { server_key: sender.secret_key, emitFrom: sender.socketId } });
  }
}

export const StoredSocket: { socketIo: SocketManager | undefined } = { socketIo: undefined };

const initializeSocket = (io: Server) => {
  try {
    const socketIo = new SocketManager(io);
    Object.defineProperty(StoredSocket, 'socketIo', {
      value: socketIo,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    logger.info('webSocket server initialized');
  } catch (error) {
    logger.error(`error during the socket initialize instance: ${error}`);
  }
};

export default initializeSocket;
