import type { Socket } from 'socket.io';
import { TokenUser } from './token';

export type socketPropsList = {
  refreshToken: string;
  socketId: string;
  secret_key: string;
};

interface SocketIo extends Socket {
  user: TokenUser;
}

interface eventData {
  eventName: string;
  body?: unknown;
  text?: string;
  date?: string;
}
