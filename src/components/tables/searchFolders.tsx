'use client';

import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import type { searchFoldersType } from '@/interfaces/searches';
import cn from '@/utils/cn';
import { useIntersection } from '@mantine/hooks';
import { Skeleton } from '@nextui-org/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import Button from '../buttons';
import Popup from '../card/popup';
import SearchCard from '../card/search';
import SearchBar from '../inputs/search';

const SearchFolders = ({
  foldersProps,
  total,
  className,
}: {
  foldersProps: searchFoldersType[];
  total: number;
  className?: string;
}) => {
  const [foldersList, setFoldersList] = useState<searchFoldersType[]>(
    foldersProps ?? [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const lastItemsFetched = useRef<HTMLDivElement>(null);
  const [emptyFolders, setEmptyFolders] = useState<number[]>([]);
  const [search, setSearch] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();
  const [folder, setFolder] = useState<
    Record<'name' | 'id', string> | undefined
  >();
  const {
    services: { getSearchFolder, removeSearchFolder },
  } = useAppContext();

  useEffect(() => {
    if (foldersList.length === total) {
      const modulo = 3 - (foldersList.length % 3) || 3;
      const emptyFolders = Array.from({ length: modulo }, (_, index) => index);
      setEmptyFolders(emptyFolders);
    }
  }, [foldersList.length, total]);

  const handleSearch = useCallback(
    async (value: string) => {
      setSearch(value);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        const { err, res } = await getSearchFolder({
          page: 1,
          ...(value && { name: value }),
        });
        setLoading(false);
        if (err) {
          throw new ClientException();
        }

        const { folders }: { folders: searchFoldersType[] } = res as any;
        setFoldersList(folders);
        // setFoldersList(prev => [...prev, ...folders].filter((item, index, arr) => arr.findIndex(t => t.id === item.id) === index));
      }, 250);
    },
    [getSearchFolder],
  );

  const handleConfirmDeleteFolder = useCallback(
    async (id: string) => {
      if (!id) {
        return;
      }
      const { err, res } = await removeSearchFolder(Number.parseInt(id, 10));
      if (err || !res) {
        throw new ClientException(500, 'Error on removing favorite folder');
      }

      setFoldersList((prev) => prev.filter((p) => p.id !== id));
      setFolder(undefined);
      setEmptyFolders((prev) => [...prev, prev.length + 1]);
    },
    [removeSearchFolder],
  );

  const handleDeleteFolder = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      id: string,
      name: string,
    ) => {
      e.stopPropagation();
      setFolder({ id, name });
    },
    [],
  );

  // * infinite scroll

  const { ref, entry } = useIntersection({
    root: lastItemsFetched.current,
    threshold: 1,
  });

  useEffect(() => {
    if (!entry?.isIntersecting || total <= 12) {
      return;
    }

    const folderLength = foldersList?.length;

    if (folderLength === total) {
      return;
    }

    async function fetchData() {
      const currentPage = Math.ceil(folderLength / 10);
      setLoading(true);

      const { err, res } = await getSearchFolder({
        ...(search ? { name: search } : undefined),
        page: currentPage + 1,
      });
      setLoading(false);
      if (err) {
        throw new ClientException();
      }

      const { folders }: { folders: searchFoldersType[] } = res as any;

      setFoldersList((prev) =>
        [...prev, ...folders].filter(
          (item, index, arr) =>
            arr.findIndex((t) => t.id === item.id) === index,
        ),
      );
    }
    fetchData();
  }, [
    entry?.isIntersecting,
    foldersList?.length,
    getSearchFolder,
    search,
    total,
  ]);

  return (
    <>
      {folder?.name && (
        <Popup
          onClose={() => setFolder(undefined)}
          className="md:ml-40 lg:ml-60 xl:ml-72 border-1 border-asset/25 p-6"
        >
          <span className="text-p2">
            Êtes vous sur de vouloir supprimer le dossier :
          </span>
          <span className="mt-1.5 mb-4 !text-h2 text-foreground/75">
            {folder?.name}
          </span>
          <Button
            onClick={() => handleConfirmDeleteFolder(folder.id)}
            className="!text-p3 text-errorTxt/90 md:px-2 md:h-9 lg:px-3 lg:h-10 xl:px-4 xl:h-11 font-medium bg-transparent rounded-md border-1.5 border-errorBg hover:bg-errorBg/90 hover:text-foreground"
          >
            Supprimer
          </Button>
        </Popup>
      )}
      <div
        className={cn(
          'w-full h-fit grid relative md:pt-[5.5rem] lg:pt-24 xl:pt-32',
          className,
        )}
      >
        <div className="md:w-2/5 lg:w-1/3 h-10 absolute top-3 left-1/2 -translate-x-1/2">
          <SearchBar
            label="Rechercher un dossier"
            className="bg-background/20 !rounded-lg"
            value={search}
            handleSearch={handleSearch}
          />
        </div>
        {foldersList.map((folder, i) => (
          <article
            ref={i === foldersList.length - 1 ? ref : null}
            key={i}
            className="flex w-full h-fit max-h-[30vh] flex-col py-0.5 lg:py-1 xl:py-1.5 px-0.5 xl:px-1.5 bg-content border-1 border-asset/30 rounded-lg"
          >
            <SearchCard
              setFoldersList={setFoldersList}
              foldersProps={folder}
              totalFetched={Number.parseInt(folder.itemsCount, 10)}
              className="w-full max-h-8 mt-0.5 flex flex-row justify-between items-center border-b-1 border-b-asset/30"
            >
              <div className="flex h-full ml-1 mb-1 lg:mb-0.5 flex-1 flex-row items-center justify-between">
                <div className="flex-1 flex h-fit flex-row items-center">
                  {Number.parseInt(folder.itemsCount, 10) > 0 && (
                    <p
                      className={cn(
                        'h-full -ml-0.5 rounded-md px-1.5 xl:px-[0.45rem] mr-1.5 lg:mr-2 xl:mr-2.5 border-2 border-primary',
                        {
                          'px-1 lg:px-0.5 xl:px-1':
                            Number.parseInt(folder.itemsCount, 10) > 10,
                        },
                      )}
                    >
                      <span className="!text-h4 h-fit text-special">
                        {Number.parseInt(folder.itemsCount, 10) > 99
                          ? '99+'
                          : folder.itemsCount}
                      </span>
                    </p>
                  )}

                  <h2 className="text-p1 flex-1 py-2 lg:py-[0.3rem] truncate h-fit text-foreground/80 font-semibold">
                    {folder.name}
                  </h2>
                </div>
                <div
                  onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                  className="text-[#508CFB] md:mr-1 lg:mr-1.5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 hover:cursor-pointer transition-transform duration-250 hover:text-errorTxt hover:scale-110"
                >
                  <FiTrash2 className="w-full h-full" />
                </div>
              </div>
            </SearchCard>
          </article>
        ))}
        {loading
          ? Array.from({ length: emptyFolders?.length ?? 3 }).map((v, i) => (
              <div
                key={i}
                className="relative w-full md:h-[2.85rem] -mt-1 lg:h-[3.225rem] xl:h-16 p-1"
              >
                <div className="relative w-full h-full border-1 border-load/90 bg-load/25 z-10 rounded-lg">
                  <div className="flex md:w-11/12 lg:w-[87%] flex-row items-center h-full">
                    <Skeleton className="md:ml-2 md:mr-3 lg:ml-3 lg:mr-4 xl:mr-5 md:w-5 md:h-5 lg:w-7 lg:h-7 xl:h-8 xl:w-8 rounded-md" />
                    <Skeleton className="md:h-3.5 lg:h-5 md:w-32 lg:w-36 xl:w-44 rounded-md" />
                  </div>
                </div>
              </div>
            ))
          : !!emptyFolders.length &&
            emptyFolders.map((v) => (
              <div
                key={v}
                className="w-full p-2.5 xl:px-3 h-fit flex flex-row items-center border-dashed border-1 border-[#496ee9] rounded-lg"
              >
                <h1 className="text-p1 line-clamp-1 w-full text-ellipsis h-fit text-[#5e97db] font-semibold">
                  Enregistrer une recherche
                </h1>
              </div>
            ))}
      </div>
    </>
  );
};

export default SearchFolders;
