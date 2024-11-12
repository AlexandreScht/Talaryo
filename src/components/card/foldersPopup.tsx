'use client';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { mainParams } from '@/interfaces/components';
import { FolderAction } from '@/interfaces/scrapping';
import {
  folders,
  foldersChoose,
  pageType,
  returnProps,
} from '@/interfaces/services';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast } from '@/utils/toaster';
import { useIntersection } from '@mantine/hooks';
import { ScrollShadow, Skeleton } from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CgCloseR } from 'react-icons/cg';
import Button from '../buttons';
import AddSearchForm from '../forms/search';
import SearchBar from '../inputs/search';
import FolderList from './folderList';
const FoldersPopup = ({
  className,
  pageType,
  folderType,
  handleAction,
  search,
}: {
  pageType: pageType;
  search?: mainParams;
  className?: string;
  folderType: 'favoris' | 'search';
  handleAction?: (v: FolderAction) => unknown;
}) => {
  const [textValue, setTextValue] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();
  const [state, setState] = useState<{
    err: boolean | string;
    loading: boolean;
    form?: boolean;
  }>({ err: false, loading: false });
  const [foldersList, setFoldersList] = useState<folders>({
    folders: [],
    meta: { total: undefined },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const lastItemsFetched = useRef<HTMLDivElement>(null);
  const [folderProps, setFolderProps] = useState<foldersChoose>();
  const [, setSkip] = useState<boolean>(false);
  const {
    services: {
      getFavFolders,
      addFavFolder,
      addSearchFolder,
      getSearchFolder,
      addSearch,
    },
  } = useAppContext();

  //* fetchFolders
  const fetchingData = useCallback(
    async (
      {
        page,
        search,
        limit,
      }: { page?: number; search?: string; limit?: number },
      replace?: boolean,
    ) => {
      setState((prev) => ({ ...prev, loading: true }));
      const { err, res } =
        folderType === 'favoris'
          ? await getFavFolders({ page, limit, name: search })
          : await getSearchFolder({ page, limit, name: search });
      if (err) {
        setState({
          err: 'Une erreur est survenue, veuillez réessayer plus tard',
          loading: false,
        });
        return;
      }
      const { results: folders, total } = res || { results: [], total: 0 };

      setState({ err: false, loading: false });

      setFoldersList((prev) => ({
        folders: replace ? folders : [...(prev?.folders || []), ...folders],
        meta: { total: Number.parseInt(String(total), 10) },
      }));
    },
    [folderType, getFavFolders, getSearchFolder],
  );

  //* close Folder Popup
  const handleClose = useCallback(() => {
    if (handleAction) {
      handleAction({ folderClosed: true });
    }
  }, [handleAction]);

  //* Search in folder
  const handleSearch = useCallback(
    async (value: string) => {
      setTextValue(value);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        fetchingData({ page: 1, search: value }, true);
      }, 250);
    },
    [fetchingData],
  );

  //* Create Folder
  const handleCreateFolder = useCallback(async () => {
    if (!inputRef || !inputRef.current?.value) {
      return;
    }
    const { err, res } =
      folderType === 'favoris'
        ? await addFavFolder(inputRef.current.value)
        : await addSearchFolder(inputRef.current.value);
    if (err) {
      setState({
        err: 'Une erreur est survenue, veuillez réessayer plus tard',
        loading: true,
      });
      return;
    }
    if (!res) {
      InfoToast({
        text: `le dossier ${inputRef.current.value} existe déjà`,
      });
      return;
    }

    setFoldersList({
      folders: [
        { name: (res as any).name, id: (res as any).id, itemsCount: '0' },
      ],
      meta: { total: 1 },
    });
  }, [addFavFolder, addSearchFolder, folderType]);

  //* Create Search
  const handleCreateSearch = useCallback(async () => {
    if (
      !folderProps ||
      folderProps.folderType !== 'search' ||
      !folderProps.formValues
    ) {
      return;
    }

    const {
      formValues: { name, society },
      folder: { id, itemsCount, name: folderName },
    } = folderProps;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, start, ...searches } = search || {};

    try {
      const { err, res: success } = await addSearch({
        searchQueries: JSON.stringify(searches || {}),
        name,
        searchFolderId: id,
        society,
        isCv: pageType === 'cv',
      });

      if (err) {
        if ((success as any)?.plan) {
          ErrorToast({ text: (success as any).plan });
          if (handleAction) {
            handleAction({ folderClosed: true });
          }
          return;
        }
        throw new ClientException(
          500,
          "Une erreur est survenue lors de l'enregistrement de la recherche. Veuillez réessayer plus tard.",
        );
      }
      if (!success) {
        InfoToast({
          text: `Le nom de recherche "${name}" existe déjà dans le dossier "${folderName}"`,
        });
      }
      setFoldersList((prev) => ({
        ...prev,
        folders: prev.folders.map((f) =>
          f.id === id
            ? {
                ...f,
                itemsCount: String(Number.parseInt(itemsCount || '0') + 1),
              }
            : f,
        ),
      }));
    } catch (error) {
      throw new ClientException(
        500,
        "Une erreur est survenue lors de l'enregistrement de la recherche. Veuillez réessayer plus tard.",
      );
    }
  }, [addSearch, folderProps, handleAction, pageType, search]);

  const createFavReturn = useCallback(
    (values: returnProps | false) => {
      if (!values && handleAction) {
        handleAction({ folderClosed: true });
        return;
      }
      if (values) {
        setFoldersList((prev) => ({
          ...prev,
          folders: prev.folders.map((f) =>
            Number.parseInt(f.id) === values.id
              ? { ...f, itemsCount: String((values.itemsCount || 0) + 1) }
              : f,
          ),
        }));
      }
    },
    [handleAction],
  );

  const controller = useCallback(
    (folderProps: foldersChoose) => {
      if (folderProps?.folderType === 'search') {
        setSkip((v) => {
          if (v) {
            handleCreateSearch();
          }
          return !v;
        });
      }
      if (folderProps?.folderType === 'favoris' && handleAction) {
        setSkip((v) => {
          if (v) {
            handleAction({
              selectFav: {
                folder: folderProps.folder,
                returnProps: createFavReturn,
              },
            });
          }
          return !v;
        });
      }
    },
    [createFavReturn, handleAction, handleCreateSearch],
  );

  //* controller
  const displaySearchForm: boolean = useMemo(() => {
    if (
      ((folderProps?.folderType === 'search' && !!folderProps?.formValues) ||
        folderProps?.folderType === 'favoris') &&
      !!folderProps.folder
    ) {
      controller(folderProps);
      setFolderProps(undefined);
    } else {
      setSkip(true);
    }
    return folderProps?.folderType === 'search' && !folderProps?.formValues;
  }, [controller, folderProps]);

  //* Infinite Scroll

  const { ref, entry } = useIntersection({
    root: lastItemsFetched.current,
    threshold: 1,
  });

  useEffect(() => {
    const {
      folders,
      meta: { total },
    } = foldersList || { meta: {} };
    if (folders?.length === total) {
      return;
    }

    const fecthFolders = async () => {
      if (!entry?.isIntersecting && folders?.length && !total) {
        await fetchingData({ page: 1, search: textValue ?? '' }, true);
        return;
      }

      if (
        !entry?.isIntersecting === false &&
        folders?.length &&
        folders?.length !== total
      ) {
        await fetchingData({
          page: Math.ceil(folders.length / 10) + 1,
          search: textValue ?? '',
        });
        return;
      }

      if (!folders?.length && total === undefined && !textValue) {
        await fetchingData({ page: 1 }, true);
      }
    };

    fecthFolders();
  }, [entry?.isIntersecting, fetchingData, foldersList, textValue]);

  if (folderType !== 'favoris' && folderType !== 'search') {
    return <></>;
  }

  const loadingSkeleton = () => {
    return (
      <div className="md:py-1 lg:py-1.5 flex flex-row items-center w-full border-load/90 bg-load/25 justify-between rounded-md">
        <Skeleton className="md:w-20 lg:w-24 xl:w-28 h-3 lg:h-4 xl:h-5 md:ml-1 lg:ml-2 mt-0.5 rounded"></Skeleton>
        <Skeleton className="md:w-4 lg:w-5 xl:w-6 h-3 lg:h-4 xl:h-5 mr-0.5 rounded"></Skeleton>
      </div>
    );
  };

  return (
    <section
      className={cn(
        'md:px-3 md:py-2.5 lg:px-5 lg:py-4 relative w-full bg-content border-1 border-foreground/30 flex flex-col items-start rounded-lg',
        className,
      )}
    >
      <div className="w-full pb-2 flex flex-row justify-between items-center border-b-1 border-foreground/30">
        <h1 className="w-full text-h3">Choisissez votre dossier</h1>
        <CgCloseR
          onClick={handleClose}
          className="md:w-5 md:h-5 lg:w-6 lg:h-6 mt-0.5 text-foreground/60 cursor-pointer hover:text-teal-800"
        />
      </div>
      <div className="relative w-full">
        {displaySearchForm ? (
          <AddSearchForm setFolderProps={setFolderProps} />
        ) : (
          <>
            <SearchBar
              className="md:mb-3.5 lg:mb-5"
              value={textValue}
              label="Rechercher un dossier"
              handleSearch={handleSearch}
            />
            {state.err ? (
              <div className="w-full py-1 md:pl-1 lg:pl-2 flex">
                <span className="!text-p1 text-foreground/90 text-center">
                  {state.err}
                </span>
              </div>
            ) : foldersList?.folders?.length ? (
              <ScrollShadow
                size={20}
                hideScrollBar
                orientation="vertical"
                className="md:space-y-1.5 lg:space-y-2 w-full h-fit md:max-h-40 lg:max-h-52 min-h-[2rem]"
              >
                {foldersList.folders.map((folder, i) => (
                  <div
                    key={i}
                    ref={i === foldersList.folders.length - 1 ? ref : null}
                  >
                    <FolderList
                      folder={folder}
                      folderType={folderType}
                      setFolderProps={setFolderProps}
                      className="flex flex-row w-full justify-between py-1 md:pl-1 lg:pl-2 group hover:text-white/90 hover:bg-gradient-to-bl from-primary to-secondary/75 cursor-pointer rounded-md"
                    />
                  </div>
                ))}
                {state.loading && loadingSkeleton()}
              </ScrollShadow>
            ) : state.loading ? (
              loadingSkeleton()
            ) : (
              <div className="flex flex-row w-full justify-between h-10">
                <input
                  ref={inputRef}
                  placeholder="Nom du dossier..."
                  type="text"
                  defaultValue={textValue}
                  className="w-full bg-transparent text-p2 border-b-1 border-foreground/30 mr-5 outline-none"
                />
                <Button
                  onClick={handleCreateFolder}
                  className="min-w-0 lg:px-4 xl:px-5 !text-p3 min-h-0 lg:py-2.5 h-fit bg-transparent rounded-md text-foreground/90 hover:text-white/90 hover:bg-primary border-1 border-foreground/20"
                >
                  Ajouter
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FoldersPopup;
