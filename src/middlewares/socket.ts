import config from '@/config';
import { ServerException } from '@/exceptions';
import type { TokenUser } from '@/interfaces/token';
import type { socketList } from '@/interfaces/webSocket';
import { decryptUserToken } from '@/utils/token';
import { parse } from 'cookie';
import { Socket } from 'socket.io';

const socketIoMiddleware = async (
  { socket, secret_key, list }: { socket: Socket; secret_key: string; list: socketList[] },
  next: (result: { err?: ServerException; result?: { user: TokenUser; session_double?: socketList } }) => void,
) => {
  if (!secret_key) {
    next({ err: new ServerException(500, 'Secret_key is required') });
    return;
  }
  const { cookie: allCookie, origin } = socket.handshake.headers;
  const cookieAuth = parse(allCookie)[config.COOKIE_NAME];

  if (!cookieAuth || origin !== config.ORIGIN) {
    next({ err: new ServerException(500, 'Io props incorrect') });
    return;
  }

  const [error, user] = decryptUserToken(cookieAuth);

  if (error) {
    console.log(error);
    next({ err: new ServerException(500, 'Cookie incorrect') });
    return;
  }

  const withoutDoubleUser = list.filter(u => u.userId !== user.sessionId || u.refreshToken !== user.refreshToken);
  const isDoubleLogin = withoutDoubleUser.find(u => u.userId === user.sessionId);

  next({ result: { user, session_double: isDoubleLogin } });
};

export default socketIoMiddleware;
