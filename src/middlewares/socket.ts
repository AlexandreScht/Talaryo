'use client';

import { ClientException } from '@/exceptions';
import { IoSocket } from '@/interfaces/routes';
import { Socket } from 'socket.io-client';

const socketUrl = (uri: string) => uri.slice(0, -4);
type authIo = {
  server_key: string;
  emitFrom: string;
};
const SocketIoMiddleware = async (
  { newSocket, auth: { server_key, emitFrom } }: { newSocket: Socket; auth: authIo },
  { secret_key }: { secret_key: string },
  socket_url: string,
  next: (err?: ClientException) => void,
) => {
  if (!secret_key) {
    next(new ClientException(500, 'Secret_key is required'));
    return;
  }
  const {
    io: { uri },
    id: socketId,
  } = newSocket as IoSocket;

  if (uri === socketUrl(socket_url)) {
    next(new ClientException(500, 'Incorrect Origin io emitted'));
    return;
  }

  if (server_key !== secret_key || emitFrom !== socketId) {
    next(new ClientException(500, 'Invalid payload'));
    return;
  }

  next();
};

export default SocketIoMiddleware;
