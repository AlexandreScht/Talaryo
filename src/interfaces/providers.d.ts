import type actions from '@/actions';
import type PrepareServices from '@/services';
import type stores from '@/stores';
import { socketListener } from './events';

type Services = ReturnType<typeof PrepareServices>;
type Stores = typeof stores;
type Action = typeof actions;

export type AppContextValues = {
  actions: Action;
  services: Awaited<Services>;
  stores: Stores;
};

interface SocketContextValues {
  socketListener: socketListener[];
  ioSocketSend: ({ name, value }: { name: string; value: unknown }) => void;
}

export interface ContextProviderProps {
  children: React.ReactNode;
}

type GoogleAnalyticValues = {
  trackGAEvent: (
    category: GAaction,
    action: string,
    label: string,
    value: number,
    callback?: () => void,
  ) => void;
} | null;

type GAaction =
  | 'Click'
  | 'Scroll'
  | 'Send'
  | 'Download'
  | 'Navigate'
  | 'Search'
  | 'Web Vitals'
  | 'Slider'
  | 'Subscription';
