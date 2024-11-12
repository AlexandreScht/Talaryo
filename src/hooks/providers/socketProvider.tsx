'use client';

import config from '@/config';
import { ClientException } from '@/exceptions';
import { authEvent, deleteSubscribeEvent, paymentSuccessEvent, socketListener } from '@/interfaces/events';
import { ContextProviderProps, SocketContextValues } from '@/interfaces/providers';
import { scrappingCVProps } from '@/interfaces/scrapping';
import { userPayload } from '@/interfaces/users';
import { haveAccess, publicPaths } from '@/middlewares/autorisation';
import SocketIoMiddleware from '@/middlewares/socket';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import useAppContext from './AppProvider';

const SocketContext = createContext<SocketContextValues | null>(null);

const { origin } = config;

export const SocketContextProvider = ({ children, socketURI }: ContextProviderProps & { socketURI: string }) => {
  const { data: session, update } = useSession();
  const route = usePathname();
  const router = useRouter();
  const [socketListener, setSocketListener] = useState<socketListener[]>([]);
  const socketRef = useRef<Socket>();
  const secretKeyRef = useRef<string>(uuidv4());
  const {
    actions: { addingCvStream },
  } = useAppContext();

  const isPublicRoute = useMemo(() => {
    return publicPaths.includes(route);
  }, [route]);

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    const secret_key = secretKeyRef.current;
    try {
      const newSocket = io(socketURI, {
        transports: ['websocket', 'polling', 'flashsocket'],
        extraHeaders: { Origin: origin || '' },
        auth: {
          secret_key,
        },
      });

      if (newSocket) {
        newSocket.on('connect', () => {
          newSocket.emit('ioLogged');

          //> detect double authentication
          newSocket.on('session_double', ({ auth }) => {
            console.log('double sessionnnn !!!!');

            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, err => {
              newSocket.disconnect();
              if (!err) {
                signOut({ redirect: true });
              }
            });
          });

          //> billing event

          newSocket.on(
            'payment_success',
            ({ value, text, date, auth }: { value?: paymentSuccessEvent; text: string; date: string; auth: authEvent }) => {
              SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
                if (err) {
                  throw err;
                }
                const {
                  cookie,
                  token: { jwt },
                  role,
                } = value || { token: {} };

                if (!cookie || !jwt || !role) {
                  throw new ClientException();
                }
                document.cookie = cookie;

                await update({
                  ...session,
                  user: {
                    ...session?.user,
                    jwt,
                  },
                });
                revalidatePaths([route]);

                setSocketListener(prev => [
                  ...prev.filter(v => v.name !== 'bill_event'),
                  { name: 'bill_event', value: { text, date, sawIt: false } },
                ]);

                if (route === routes.pages.billing()) {
                  router.refresh();
                  return;
                }
                if (!haveAccess({ route, user: { role } as userPayload })) {
                  return router.replace(routes.pages.home());
                }
              });
            },
          );

          newSocket.on('subscription_cycle', ({ text, date, auth }: { text: string; date: string; auth: authEvent }) => {
            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
              if (err) {
                throw err;
              }
              setSocketListener(prev => [...prev.filter(v => v.name !== 'bill_event'), { name: 'bill_event', value: { text, date, sawIt: false } }]);
            });
          });
          newSocket.on('the_test', ({ text, date, auth }: { text: string; date: string; auth: authEvent }) => {
            console.log('here');

            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
              if (err) {
                throw err;
              }
              setSocketListener(prev => [...prev.filter(v => v.name !== 'bill_event'), { name: 'bill_event', value: { text, date, sawIt: false } }]);
            });
          });

          newSocket.on('cancel_subscribe', ({ text, date, auth }: { text: string; date: string; auth: authEvent }) => {
            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
              if (err) {
                throw err;
              }
              setSocketListener(prev => [...prev.filter(v => v.name !== 'bill_event'), { name: 'bill_event', value: { text, date, sawIt: false } }]);
            });
          });

          newSocket.on(
            'delete_subscribe',
            ({ value, text, date, auth }: { value?: deleteSubscribeEvent; text: string; date: string; auth: authEvent }) => {
              SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
                if (err) {
                  throw err;
                }
                const {
                  cookie,
                  token: { jwt },
                } = value || { token: {} };

                if (!cookie || !jwt) {
                  throw new ClientException();
                }
                document.cookie = cookie;

                await update({
                  ...session,
                  user: {
                    ...session?.user,
                    jwt,
                  },
                });
                revalidatePaths([route]);

                setSocketListener(prev => [
                  ...prev.filter(v => v.name !== 'bill_event'),
                  { name: 'bill_event', value: { text, date, sawIt: false } },
                ]);
                if (route === routes.pages.billing()) {
                  router.refresh();
                  return;
                }

                if (
                  !haveAccess({
                    route,
                    user: { role: 'free' } as userPayload,
                  })
                ) {
                  return router.replace(routes.pages.home());
                }
              });
            },
          );
          //> cv scrape
          newSocket.on('CvSearch', ({ value, auth }: { value: scrappingCVProps; auth: authEvent }) => {
            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
              if (err) {
                throw err;
              }
              if (!value?.isEnd) {
                addingCvStream({
                  profile: { ...value },
                  pageType: 'cv',
                });
              }
              setSocketListener(prev => [...prev.filter(v => v.name !== 'cv_event'), { name: 'cv_event', value: { ...value } }]);
            });
          });

          //> info event
          newSocket.on('update', ({ text, date, auth }: { text: string; date: string; auth: authEvent }) => {
            SocketIoMiddleware({ newSocket, auth }, { secret_key }, socketURI, async err => {
              if (err) {
                throw err;
              }

              setSocketListener(prev => [...prev.filter(v => v.name !== 'info_event'), { name: 'info_event', value: { text, date, sawIt: false } }]);
            });
          });
        });

        socketRef.current = newSocket;
      }

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      throw new ClientException();
    }
  }, [addingCvStream, route, router, session, update]);

  const ioSocketSend = useCallback(({ name, value }: { name: string; value: unknown }) => {
    if (socketRef.current) {
      socketRef.current.emit(name, {
        value,
        secret_key: secretKeyRef.current,
      });
    }
  }, []);

  const context: SocketContextValues = useMemo(
    () => ({
      socketListener,
      ioSocketSend,
    }),
    [ioSocketSend, socketListener],
  );

  return <SocketContext.Provider value={context}>{children}</SocketContext.Provider>;
};

export default function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new ClientException(404, 'useSocketContext must be used within an SocketContextProvider');
  }
  return context;
}
