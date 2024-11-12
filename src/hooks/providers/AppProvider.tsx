'use client';

import actions from '@/actions';
import { ClientException } from '@/exceptions';
import { AppContextValues } from '@/interfaces/providers';
import PrepareServices from '@/services';
import stores from '@/stores';
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useMemo } from 'react';
interface AppContextProviderProps {
  children: React.ReactNode;
  token?: string;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextValues | null>(null);

export function AppContextProvider({ children, token }: AppContextProviderProps) {
  const services = PrepareServices({ token });

  const contextValue = useMemo(() => {
    return {
      services,
      stores,
      actions,
    } satisfies AppContextValues;
  }, [services]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export default function useAppContext({
  token,
  setLoading,
}: {
  token?: string;
  setLoading?: Dispatch<SetStateAction<boolean>>;
} = {}) {
  const context = useContext(AppContext);

  if (!context) {
    throw new ClientException(404, 'useAppContext must be used within an AppContextProvider');
  }

  if (token || setLoading) {
    const services = PrepareServices({ token });
    return {
      ...context,
      services,
    };
  }

  return context;
}
