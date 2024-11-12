import { role } from './users';

interface eventStore {
  date?: string;
  text?: string;
  value?: unknown;
  sawIt?: boolean;
  user?: string;
}

interface paymentSuccessEvent {
  cookie: string;
  token: {
    jwt: string;
  };
  role: role;
}
interface deleteSubscribeEvent {
  cookie: string;
  token: {
    jwt: string;
  };
}

interface authEvent {
  server_key: string;
  emitFrom: string;
}

interface socketListener {
  name: string;
  value: unknown;
}
