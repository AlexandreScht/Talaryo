import config from '@/config';
import { ServerException } from '@/exceptions';
import { TokenUser } from '@/interfaces/auth';
import { userList } from '@/interfaces/user';
import { decryptUserToken } from '@/libs/token';
import { parse } from 'cookie';
import { Socket } from 'socket.io';

const socketIoMiddleware = async (
  { socket, secret_key, list }: { socket: Socket; secret_key: string; list: userList[] },
  next: (result: { err?: ServerException; user?: TokenUser; session_server?: string }) => void,
) => {
  const { cookie, origin } = socket.handshake.headers;
  const cookieAuth = parse(cookie)[config.COOKIE_NAME];

  if (secret_key && Array.isArray(list) && cookieAuth && origin === config.ORIGIN) {
    const [error, user] = decryptUserToken(cookieAuth);
    if (error) {
      return next({ err: new ServerException(500, 'Cookie non valide.') });
    }
    if (list.length > 0 && list.some(u => u.userId === user.sessionId)) {
      if (list.some(u => u.socketId === socket.id && u.secret_key === secret_key)) {
        next({ user });
      } else {
        next({ err: new ServerException(500, 'Request non valide') });
      }
    } else {
      next({ user });
    }
  } else {
    next({ err: new ServerException(500, 'Props non valide') });
  }
};

export default socketIoMiddleware;
