import { mainParams } from '@/interfaces/components';
import {
  profils,
  scrappingCVProps,
  scrappingDataStorage,
  scrappingInfos,
  scrappingReseauProps,
  scrappingStorage,
  trainingData,
  trainingStorage,
} from '@/interfaces/scrapping';
import { pageType } from '@/interfaces/services';
import { sessionStorageManager } from '@/libs/storage';

function isNewSearch(
  obj1: Record<string, string | string[]>,
  obj2: mainParams,
): boolean {
  const filteredItems = (
    obj: Record<string, string | string[]> | mainParams,
  ): object => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { start, index, ...other } = obj;
    return other;
  };

  const filtered1 = filteredItems(obj1);
  const filtered2 = filteredItems(obj2);

  return JSON.stringify(filtered1) !== JSON.stringify(filtered2);
}

const setSearch = ({
  profils,
  pageType,
  search,
  newSearch,
  training,
}: {
  profils: profils | trainingData;
  pageType: pageType;
  search: mainParams;
  newSearch: boolean;
  training?: true;
}) => {
  try {
    if (training) {
      const { res, data } = profils as trainingData;
      sessionStorageManager.setItem<trainingStorage>('trainingIa', {
        list: res,
        data: data,
      });
      return;
    }
    const { pages } =
      sessionStorageManager.getItem<scrappingStorage>('candidat_by_Talaryo') ||
      {};
    const { res, data } = profils as profils;
    sessionStorageManager.setItem<scrappingStorage>('candidat_by_Talaryo', {
      pages: newSearch
        ? Array.isArray(res)
          ? res
          : [res]
        : [...(pages || []), ...res],
      [pageType]: {
        data: {
          ...data,
          search,
        },
      },
    });
  } catch (error) {
    console.error('Failed to set search in sessionStorage:', error);
  }
};

const addingCvStream = ({
  profile,
  pageType,
}: {
  profile: scrappingInfos | object;
  pageType: pageType;
}) => {
  const props =
    sessionStorageManager.getItem<scrappingStorage>('candidat_by_Talaryo') ||
    ({} as scrappingStorage);
  const { pages = [] } = props;
  const data = props[pageType]?.data || ({} as scrappingDataStorage);

  if (Object.keys(profile).length) {
    sessionStorageManager.setItem<scrappingStorage>('candidat_by_Talaryo', {
      pages: [...pages, profile as scrappingInfos],
      [pageType]: { data: { ...data } },
    });
  } else {
    const newTotal = data.total - 1;
    sessionStorageManager.setItem<scrappingStorage>('candidat_by_Talaryo', {
      pages,
      [pageType]: {
        data: {
          ...data,
          total: newTotal <= 0 ? 0 : newTotal,
        },
      },
    });
  }
};

const isSameSearch = ({
  search,
  page,
}: {
  search: Record<string, string | string[]>;
  page: pageType;
}): boolean => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    const dataObj = store?.[page]?.data;

    if (!store?.pages?.filter((v) => v)?.length) {
      return false;
    }

    return dataObj ? !isNewSearch(search, dataObj.search) : false;
  } catch (error) {
    console.error('Failed to get search data from sessionStorage:', error);
    return false;
  }
};

const resetSearch = (page: pageType) => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (store) {
      sessionStorageManager.setItem('candidat_by_Talaryo', {
        ...store,
        pages: store.pages.filter((v) =>
          page === 'pro' ? 'pdf' in v : 'link' in v,
        ),
        [page]: { search: undefined },
      } as scrappingStorage);
    }
  } catch (error) {
    console.error('Failed to reset search in sessionStorage:', error);
  }
};

const newFav = (values: scrappingInfos) => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (store) {
      store.pages = store.pages.map((v) => {
        if (
          'link' in values &&
          (v as scrappingReseauProps).link === values.link
        ) {
          return {
            ...v,
            favFolderId: values.favFolderId,
            id: values.id,
          };
        } else if (
          'pdf' in values &&
          (v as scrappingCVProps).pdf === values.pdf
        ) {
          return {
            ...v,
            favFolderId: values.favFolderId,
            id: values.id,
          };
        }
        return v;
      });

      sessionStorageManager.setItem('candidat_by_Talaryo', store);
    }
  } catch (error) {
    console.error('Failed to add new favorite in sessionStorage:', error);
  }
};

const removeFav = (values: scrappingInfos) => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (store) {
      store.pages = store.pages.map((v) => {
        if (
          'link' in values &&
          (v as scrappingReseauProps).link === values.link
        ) {
          return {
            ...v,
            favFolderId: undefined,
          };
        } else if (
          'pdf' in values &&
          (v as scrappingCVProps).pdf === values.pdf
        ) {
          return {
            ...v,
            favFolderId: undefined,
          };
        }
        return v;
      });

      sessionStorageManager.setItem('candidat_by_Talaryo', store);
    }
  } catch (error) {
    console.error('Failed to remove favorite in sessionStorage:', error);
  }
};

const removeFavInFolder = (folderId: number) => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (store) {
      store.pages = store.pages.map((v) => {
        if (v.favFolderId === folderId) {
          return {
            ...v,
            favFolderId: undefined,
          };
        }
        return v;
      });

      sessionStorageManager.setItem('candidat_by_Talaryo', store);
    }
  } catch (error) {
    console.error(
      'Failed to remove favorites in folder in sessionStorage:',
      error,
    );
  }
};

const setScrapeMail = ({ link, value }: { link: string; value?: string }) => {
  try {
    const store = sessionStorageManager.getItem<scrappingStorage>(
      'candidat_by_Talaryo',
    );
    if (store) {
      // @ts-expect-error not
      store.pages = store.pages.map((objA) => {
        if ('link' in objA && objA.link === link) {
          return {
            ...objA,
            email: value,
          };
        }
        return objA;
      });

      sessionStorageManager.setItem('candidat_by_Talaryo', store);
    }
  } catch (error) {
    console.error('Failed to set scrape mail in sessionStorage:', error);
  }
};

const actions = {
  setSearch,
  isSameSearch,
  newFav,
  removeFav,
  addingCvStream,
  removeFavInFolder,
  resetSearch,
  setScrapeMail,
};

export default actions;
