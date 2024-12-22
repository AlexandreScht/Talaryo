// socketAuthMiddleware.ts

import config from '@/config';
import { ServerException } from '@/exceptions';
import { TokenUser } from '@/interfaces/token';
import { SocketIo, socketPropsList } from '@/interfaces/webSocket';
import { logger } from '@/utils/logger';
import { getSignedCookieValue } from '@/utils/token';
import { parse } from 'cookie';

const socketMiddleware = (socketList: Map<string, socketPropsList>) => async (socket: SocketIo, next: (err?: Error) => void) => {
  try {
    const { secret_key } = socket.handshake.auth;
    const { cookie: allCookie, origin } = socket.handshake.headers;

    if (!secret_key) {
      throw new ServerException(500, 'Secret_key is required');
    }

    const cookieAuth = parse(allCookie || '')[config.COOKIE_NAME];
    if (!cookieAuth || origin !== config.ORIGIN) {
      throw new ServerException(500, 'Io props incorrect');
    }

    const user = getSignedCookieValue<TokenUser>(cookieAuth);

    if (!user) {
      throw new ServerException(500, 'Cookie incorrect');
    }

    const socketUser = socketList.get(String(user.sessionId));
    const isDoubleAuth = socketUser && socketUser.refreshToken !== user.refreshToken;

    if (isDoubleAuth) {
      socket.to(socketUser.socketId).emit('session_double', undefined);
      socket.to(socketUser.socketId).disconnectSockets();
    }
    socketList.set(String(user.sessionId), { refreshToken: user.refreshToken, socketId: socket.id, secret_key });

    socket.user = user;
    next();
  } catch (err) {
    logger.error('socketMiddleware error =>', err);
    socket.disconnect(true);
    next(new Error(err));
  }
};

export default socketMiddleware;
