'use client';
import { FilledFolder } from '@/assets/filledFolder';
import { NewFolder } from '@/assets/newFolder';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import type { ServicesPagination, folders, foldersList } from '@/interfaces/services';
import routes from '@/routes';
import { InfoToast } from '@/utils/toaster';
import { useIntersection } from '@mantine/hooks';
import { Skeleton } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import Button from '../buttons';
import Popup from '../card/popup';
import SearchBar from '../inputs/search';

const FolderTable = ({ foldersFetchList }: { foldersFetchList: folders }) => {
  const [foldersList, setFoldersList] = useState<folders>(foldersFetchList ?? []);
  const [emptyFolders, setEmptyFolders] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const lastItemsFetched = useRef<HTMLDivElement>(null);
  const limitLength = useRef<boolean>(false);
  const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();
  const [deleteFolder, setDeleteFolder] = useState<Record<'name' | 'id', string> | undefined>();
  const {
    actions: { removeFavInFolder },
    services: { getFavFolders, removeFavFolder, addFavFolder },
  } = useAppContext();

  const handleCreateFolder = useCallback(
    async (index: number) => {
      const input = inputRefs.current[index]?.current;
      if (!input?.value) {
        input?.select();
        return;
      }
      const { err, res } = await addFavFolder(input.value);

      if (err) {
        throw new ClientException();
      }
      if (!res) {
        InfoToast({ text: `le dossier "${input.value}" existe déjà` });
        return;
      }
      const newFolder: foldersList = {
        name: res.name,
        id: res.id,
        itemsCount: '0',
      };

      input.value = '';
      input.blur();
      setFoldersList(prev => ({
        meta: { total: (prev?.meta?.total || 0) + 1 },
        folders: [...(prev?.folders || []), newFolder],
      }));
    },
    [addFavFolder],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, v: number) => {
      if (e.key === 'Enter') {
        handleCreateFolder(v);
      }
    },
    [handleCreateFolder],
  );

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = useCallback(e => {
    e.target.placeholder = '';
  }, []);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(e => {
    e.target.placeholder = 'Nouveaux Dossier';
  }, []);

  const handleConfirmDeleteFolder = useCallback(
    async (id: string) => {
      if (!id) {
        return;
      }
      const { err, res } = await removeFavFolder(Number.parseInt(id, 10));
      if (err || !res) {
        throw new ClientException(500, 'Error on removing favorite folder');
      }

      setFoldersList(prev => ({
        meta: { total: (prev?.meta?.total || 0) - 1 },
        folders: prev?.folders.filter(item => item.id !== id),
      }));
      removeFavInFolder(Number.parseInt(id));
      setDeleteFolder(undefined);
    },
    [removeFavFolder, removeFavInFolder],
  );

  const handleDeleteFolder = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string, name: string) => {
    e.stopPropagation();
    setDeleteFolder({ id, name });
  }, []);

  const handleChooseFolder = useCallback(
    (name: string) => {
      router.replace(routes.pages.favoris([name, 1]));
    },
    [router],
  );

  const handleSearch = useCallback(
    async (value: string) => {
      setSearch(value);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        const query: ServicesPagination = {
          page: 1,
          ...(value && { name: value }),
        };
        const [err, res] = (await getFavFolders(query)) as [string, { folders: foldersList[]; meta: object }];

        setLoading(false);
        if (err) {
          throw new ClientException();
        }

        const { folders } = res;
        if (!folders.length) {
          limitLength.current = true;
        }

        setFoldersList({
          meta: res.meta,
          folders: res.folders,
        });
      }, 250);
    },
    [getFavFolders],
  );

  useEffect(() => {
    if (foldersList?.meta?.total === foldersList?.folders?.length) {
      const modulo = 4 - (foldersList?.folders?.length % 4) || 4;
      const emptyFolders = Array.from({ length: modulo }, (_, index) => index);

      inputRefs.current = emptyFolders.map(() => React.createRef());
      setEmptyFolders(emptyFolders);
    }
  }, [foldersList?.folders?.length, foldersList?.meta?.total]);

  // * infinite scroll

  const { ref, entry } = useIntersection({
    root: lastItemsFetched.current,
    threshold: 1,
  });

  useEffect(() => {
    if (!entry?.isIntersecting || foldersList.folders.length <= 11 || limitLength.current) {
      return;
    }

    const folderLength = foldersList?.folders?.length;

    const currentPage = Math.ceil(folderLength / 12);
    async function fetchData() {
      setLoading(true);
      const query: ServicesPagination = {
        page: currentPage + 1,
        limit: 12,
        ...(search && { name: search }),
      };
      const [err, res] = (await getFavFolders(query)) as [string, { folders: foldersList[]; meta: object }];
      setLoading(false);
      if (err) {
        throw new ClientException();
      }

      const { folders } = res;
      if (!folders.length) {
        limitLength.current = true;
      }

      setFoldersList(prev => ({
        meta: res.meta,
        folders: [...(prev.folders || []), ...folders].filter((item, index, arr) => arr.findIndex(t => t.id === item.id) === index),
      }));
    }
    fetchData();
  }, [entry?.isIntersecting, foldersList?.folders?.length, getFavFolders, search]);

  return (
    <>
      {deleteFolder?.name && (
        <Popup onClose={() => setDeleteFolder(undefined)} className="md:ml-40 lg:ml-60 xl:ml-72 border-1 border-asset/25 p-6">
          <span className="text-p2">Êtes vous sur de vouloir supprimer le dossier :</span>
          <span className="mt-1.5 mb-4 !text-h2 text-foreground/75">{deleteFolder?.name}</span>
          <Button
            onClick={() => handleConfirmDeleteFolder(deleteFolder.id)}
            className="!text-p3 text-errorTxt/90 md:px-2 md:h-9 lg:px-3 lg:h-10 xl:px-4 xl:h-11 font-medium bg-transparent rounded-md border-1.5 border-errorBg hover:bg-errorBg/90 hover:text-foreground"
          >
            Supprimer
          </Button>
        </Popup>
      )}
      <div className="md:w-2/5 lg:w-1/3 h-10 absolute top-3 left-1/2 -translate-x-1/2">
        <SearchBar textSize="p3" label="Rechercher un dossier" className="bg-background/20 !rounded-lg" value={search} handleSearch={handleSearch} />
      </div>
      {foldersList?.folders?.map((v, i) => (
        <div
          key={i}
          onClick={() => handleChooseFolder(v?.name || 'Undefined')}
          ref={i === foldersList.folders.length - 1 ? ref : null}
          className="flex flex-col items-center cursor-pointer transition-transform duration-250 hover:scale-105 h-fit"
        >
          <FilledFolder childCount={Number.parseInt(v.itemsCount || '0', 10) || undefined} className="md:h-20 w-fit lg:h-24 xl:w-48 xl:h-28" />
          <div className="relative px-2 md:mt-2.5 lg:mt-3 xl:mt-5">
            <p className="text-p1 md:max-w-[7rem] lg:max-w-[10rem] xl:max-w-[12rem] truncate text-foreground/90 font-semibold text-center">
              {v.name}
            </p>
            <div
              onClick={e => handleDeleteFolder(e, v.id, v?.name || 'Undefined')}
              className="absolute -top-0.5 right-0 text-[#508CFB] translate-x-full md:w-[1.125rem] md:h-[1.125rem] lg:w-5 lg:h-5 xl:w-6 xl:h-6 z-10 transition-transform duration-250 hover:cursor-pointer hover:text-errorTxt hover:scale-110"
            >
              <FiTrash2 className="w-full h-full" />
            </div>
          </div>
        </div>
      ))}
      {loading
        ? Array.from({ length: emptyFolders?.length ?? 4 }).map((v, i) => (
            <div key={i} className="flex flex-col items-center h-fit md:-mt-1.5 lg:-mt-3.5">
              <div className="w-fit h-fit lg:px-0.5 md:py-2 lg:py-3 rounded-xl border-load/90 bg-load/25">
                <div className="md:px-2.5 xl:px-3.5 lg:ml-2 md:w-32 md:h-[4.5rem] lg:w-[9.5rem] lg:h-24 xl:w-52 xl:h-32 flex justify-center items-center">
                  <div className="w-full h-full">
                    <div className="w-full h-5/6 relative top-[15%]">
                      <Skeleton className="w-2/5 absolute z-10 rounded-t-lg h-1/6 -top-[15%] left-0" />
                      <Skeleton className="w-full h-full rounded-lg rounded-tl-none" />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row justify-center">
                  <Skeleton className="md:w-28 lg:w-32 xl:w-38 ml-1.5 md:mt-3 lg:mt-4 xl:mt-5 rounded md:h-3.5 xl:h-4" />
                </div>
              </div>
            </div>
          ))
        : !!emptyFolders?.length &&
          emptyFolders.map(v => (
            <div key={v} className="flex flex-col items-center transition-transform duration-250 hover:scale-105 h-fit">
              <div
                onClick={() => handleCreateFolder(v)}
                className="relative ml-0.5 md:w-[8.5rem] md:h-20 lg:w-44 lg:h-24 xl:w-52 xl:h-32 cursor-pointer flex justify-center items-center text-[#496EE9]"
              >
                <NewFolder />
              </div>
              <input
                onKeyUp={e => handleKeyPress(e, v)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                ref={inputRefs.current[v]}
                type="text"
                className="md:mt-2.5 md:ml-1 lg:mt-3.5 xl:mt-5 text-p1 md:w-[8.5rem] lg:w-44 xl:w-52 text-foreground/90 z-10 bg-transparent outline-none border-b-1 border-transparent focus:border-foreground/60 font-semibold h-fit text-center"
                placeholder="Nouveaux Dossier"
              />
            </div>
          ))}
    </>
  );
};

export default FolderTable;
