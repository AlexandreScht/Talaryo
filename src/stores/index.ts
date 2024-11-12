import { mainParams } from '@/interfaces/components';
import {
  initializedStorage,
  scrappingDataStorage,
  scrappingInfos,
  scrappingStorage,
  trainingStorage,
} from '@/interfaces/scrapping';
import { pageType } from '@/interfaces/services';
import { localStorageManager, sessionStorageManager } from '@/libs/storage';
import { ErrorToast } from '@/utils/toaster';

const getSearch = (pageType?: pageType): initializedStorage | undefined => {
  if (!pageType) {
    return undefined;
  }
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (!store) {
      return undefined;
    }
    const filteredPages = store.pages?.filter(
      (v) => v !== null && (pageType === 'pro' ? 'link' in v : 'pdf' in v),
    );

    return {
      pages: filteredPages,
      data: store[pageType]?.data as scrappingDataStorage,
    };
  } catch (error) {
    console.error('Failed to get search from sessionStorage:', error);
    return undefined;
  }
};

const getTrain = (): trainingStorage | null => {
  try {
    return sessionStorageManager.getItem<trainingStorage>('trainingIa');
  } catch (error) {
    return null;
  }
};

const getAllProfiles = (pageType?: pageType): scrappingInfos[] => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (!store || !store.pages) {
      return [];
    }
    return (
      store.pages.filter(
        (v) => v && (pageType === 'pro' ? 'link' in v : 'pdf' in v),
      ) || []
    );
  } catch (error) {
    console.error('Failed to get all profiles from sessionStorage:', error);
    return [];
  }
};

const setTimerUser = (props: storage<number>) => {
  try {
    const { storageName, values } = props;
    sessionStorageManager.setItem<number>(storageName, values);
  } catch (error) {
    console.log(error);
    ErrorToast({ text: 'Erreur interne, veuillez réessayer plus tard' });
  }
};

const setUserAnswerFor2FA = (value: boolean) => {
  try {
    localStorageManager.setItem<boolean>('User_2FA_Choice', value);
  } catch (error) {
    console.log(error);
    ErrorToast({ text: 'Erreur interne, veuillez réessayer plus tard' });
  }
};

const setTemporaryKey = <V>(props: storage<V>) => {
  try {
    const { storageName, values } = props;
    sessionStorageManager.setItem<V>(storageName, values);
  } catch (error) {
    console.log(error);
    ErrorToast({ text: 'Erreur interne, veuillez réessayer plus tard' });
  }
};

const getTimerUser = (name: string) => {
  return sessionStorageManager.getItem<number>(name);
};

const getSearchName = (search: mainParams): string => {
  const { platform, fn } = search;
  return `Talaryo-${platform ? platform : 'CV'}${fn ? `-${fn}` : ''}`;
};

const getUserAnswerFor2FA = (): boolean | null => {
  return sessionStorageManager.getItem<boolean>('User_2FA_Choice');
};

const getTemporaryKey = <T>(name: string) => {
  return sessionStorageManager.getItem<T>(name);
};

const stores = {
  getSearch,
  getAllProfiles,
  getSearchName,
  setTimerUser,
  getTimerUser,
  getTrain,
  getTemporaryKey,
  setUserAnswerFor2FA,
  getUserAnswerFor2FA,
  setTemporaryKey,
};

export default stores;
