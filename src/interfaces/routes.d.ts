import { Socket } from 'socket.io-client';

type QueryType<T> =
  T extends Record<string, string | number | boolean | unknown[]>
    ? T
    : Record<string, string | number | boolean | unknown[]>;

type ParamsType<T> = T extends (string | number | boolean)[]
  ? T
  : (string | number | boolean)[];

// Corrections ici : Utilisation des types définis correctement
type QueryRoutesType = (value?: QueryType<unknown>) => string;
type ParamsRoutesType = (value?: ParamsType<unknown>) => string;
type PropsRoutesType = (value?: ParamsType<unknown>) => string;

// Modification de RoutesPropsType pour accepter plusieurs paramètres
type RoutesPropsType = (...args: any[]) => string;

interface RouteObject {
  [key: string]: RoutesPropsType | RouteObject;
}

type ResponseType<T> = { err?: unknown; res?: T };

type IoSocket = Socket & {
  io: {
    uri?: string;
    opts: {
      extraHeaders: {
        Origin?: string;
      };
    };
  };
};
