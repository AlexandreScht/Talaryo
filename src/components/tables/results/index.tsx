'use client';

import FoldersPopup from '@/components/card/foldersPopup';
import useAppContext from '@/hooks/providers/AppProvider';
import useDebouncer from '@/hooks/useDebounce';
import { mainParams } from '@/interfaces/components';
import { visited } from '@/interfaces/scores';
import {
  FolderAction,
  scrappingCVProps,
  scrappingInfos,
  scrappingReseauProps,
} from '@/interfaces/scrapping';
import { favCreate, pageType } from '@/interfaces/services';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast } from '@/utils/toaster';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TableError from './error';
import TableHeader from './header';
import TableRows from './row';

const ProfilsTable = ({
  list,
  search,
  favPage,
  pageType,
  isLoadingPage,
  error,
  total,
}: {
  pageType?: pageType;
  list: scrappingInfos[];
  search?: mainParams;
  favPage?: scrappingInfos[];
  error: boolean;
  isLoadingPage: boolean;
  total: number;
}) => {
  const [tableItems, setTableItems] = useState<scrappingInfos[]>(list);
  const [selectedFav, setSelectedFav] = useState<scrappingInfos>();
  const [visited, setVisited] = useState<visited>({ profile: 0, cv: 0 });
  const [cvSelected, setCvSelected] = useState<boolean>(false);
  const pathName = usePathname();
  const {
    actions: { newFav, removeFav },
    services: { addingScore, addFavori, removeFavori },
  } = useAppContext();

  useEffect(() => {
    if (pathName.startsWith(routes.pages['candidats'].cvResult())) {
      setTableItems(list);
    }
  }, [list, pathName]);

  const handleCreateFav = useCallback(
    async ({ folder, returnProps, fav }: favCreate) => {
      if (!folder || (!selectedFav && !fav)) {
        return;
      }

      const currentFav = fav || selectedFav;

      const { err, res } = await addFavori({
        ...currentFav,
        ...(isScrappingReseauProps(currentFav) &&
        (currentFav as scrappingReseauProps).email
          ? { email: (currentFav as scrappingReseauProps).email }
          : {}),
        favFolderId: folder.id,
        img: currentFav?.img,
      });

      if (err) {
        ErrorToast({ error: err });
        return;
      }
      if (!res) {
        InfoToast({
          text: favPage
            ? 'Ce favoris existe déjà dans ce dossier'
            : `Ce favoris existe déjà dans le dossier "${folder.name}"`,
        });
        if (returnProps) returnProps(false);
      }

      setTableItems((prev) =>
        prev.map((o) => {
          if (isScrappingReseauProps(currentFav)) {
            if (isScrappingReseauProps(o) && o.link === currentFav.link) {
              return favPage
                ? { ...o, isFavoris: true }
                : {
                    ...o,
                    id: res as string,
                    favFolderId: Number.parseInt(folder.id),
                  };
            }
          } else if (isScrappingCVProps(currentFav)) {
            if (isScrappingCVProps(o) && o.pdf === currentFav.pdf) {
              return favPage
                ? { ...o, isFavoris: true }
                : {
                    ...o,
                    id: res as string,
                    favFolderId: Number.parseInt(folder.id),
                  };
            }
          }
          return o;
        }),
      );

      if (!favPage) {
        if (returnProps)
          returnProps({
            id: Number.parseInt(folder.id),
            itemsCount: Number.parseInt(folder?.itemsCount || '0'),
          });
      }
      newFav({ ...currentFav, favFolderId: folder.id, id: res });
    },
    [addFavori, favPage, newFav, selectedFav],
  );

  const handleToggleFav = useCallback(
    async (profile: scrappingInfos) => {
      //* remove favorites
      if (
        profile?.id &&
        ((favPage && profile?.isFavoris) || (!favPage && profile?.favFolderId))
      ) {
        const { err } = await removeFavori(Number.parseInt(profile.id));
        if (err) {
          ErrorToast({
            text: `Une erreur est survenue lors de la suppression du favor`,
          });
          return;
        }
        removeFav(profile);

        setTableItems((prev) =>
          prev.map((o) => {
            if (isScrappingReseauProps(profile)) {
              if (isScrappingReseauProps(o) && o.link === profile.link) {
                return favPage
                  ? { ...o, isFavoris: false }
                  : { ...o, favFolderId: undefined };
              }
            } else if (isScrappingCVProps(o)) {
              if (isScrappingCVProps(o) && o.pdf === profile.pdf) {
                return favPage
                  ? { ...o, isFavoris: false }
                  : { ...o, favFolderId: undefined };
              }
            }
            return o;
          }),
        );
        return;
      }

      if (favPage && !profile?.isFavoris) {
        handleCreateFav({
          folder: { id: String(profile.favFolderId as number) },
          fav: profile,
        });
        return;
      }

      //* prepare to adding
      setSelectedFav(profile);
      return;
    },
    [favPage, handleCreateFav, removeFav, removeFavori],
  );

  const handleChildrenAction = useCallback(
    (v: FolderAction) => {
      if (v.folderClosed) {
        setSelectedFav(undefined);
      }
      if (v.selectFav) {
        handleCreateFav({ ...v.selectFav });
      }
    },
    [handleCreateFav],
  );

  const openPopup = useMemo(() => {
    return !!selectedFav && !favPage;
  }, [favPage, selectedFav]);

  useDebouncer(
    (v: visited) => {
      const { profile, cv } = v;
      if (profile || cv) {
        addingScore(v as any);
        setVisited({ profile: 0, cv: 0 });
      }
    },
    visited,
    3000,
  );

  return (
    <div className="w-full relative">
      {error && !tableItems?.length ? (
        <div className="w-full h-[75vh] absolute z-50">
          <TableError favPage={!!favPage} search={search} pageType={pageType} />
        </div>
      ) : (
        <div className="w-full flex flex-col">
          <TableHeader
            pageType={pageType}
            total={total}
            hasDiplome={hasDiplome(tableItems)}
            search={search}
            favPage={favPage}
          />
          <div
            className={cn('w-full space-y-2 lg:space-y-2.5', {
              'space-y-2.5 lg:space-y-3': isLoadingPage,
            })}
          >
            {isLoadingPage
              ? Array.from({ length: 10 }).map((v, i) => (
                  <div
                    key={i}
                    className="w-full md:h-11 lg:h-12 xl:h-14 relative bg-load/25 flex flex-row space-x-4 border-1 border-load/90 text-foreground/75 items-center px-1 py-0 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-1 -ml-2 rounded-md"
                  >
                    <Skeleton className="md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 relative rounded-md" />
                    <div className="md:w-[20%] lg:w-[19%] h-full flex flex-col justify-between overflow-hidden pr-1 mb-0.5">
                      <Skeleton className="w-32 rounded-md h-5 -mb-0.5" />
                      <Skeleton className="w-20 rounded-md h-5 -mb-0.5" />
                    </div>
                    <div className="w-[30%] pr-1 h-full flex flex-col justify-between">
                      <Skeleton className="w-52 h-5" />
                      <Skeleton className="w-44 h-5" />
                    </div>
                    <div className="flex-1 pr-1 h-full flex flex-col justify-between">
                      <Skeleton className="w-full h-5" />
                      <Skeleton className="w-full h-5" />
                    </div>
                  </div>
                ))
              : tableItems?.map((profiles: scrappingInfos, i) => (
                  <TableRows
                    key={i}
                    cvSelected={cvSelected}
                    setCvSelected={setCvSelected}
                    setVisited={setVisited}
                    profile={profiles}
                    setTableItems={setTableItems}
                    search={search}
                    favPage={!!favPage}
                    handleToggleFav={handleToggleFav}
                  />
                ))}

            <div className="absolute top-2/3 left-1/2 -translate-x-1/2">
              <Popover isOpen={openPopup} backdrop="blur">
                <PopoverTrigger className="opacity-0">
                  <div className="opacity-0"></div>
                </PopoverTrigger>
                <PopoverContent className="p-0 md:w-[19rem] lg:w-96">
                  <FoldersPopup
                    pageType={pageType as pageType}
                    folderType="favoris"
                    handleAction={handleChildrenAction}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilsTable;

function isScrappingReseauProps(
  item: scrappingInfos,
): item is scrappingReseauProps {
  return 'link' in item;
}

function isScrappingCVProps(item: scrappingInfos): item is scrappingCVProps {
  return 'pdf' in item;
}

function hasDiplome(arr: scrappingInfos[] | undefined): boolean {
  return (
    arr?.some((objet) =>
      Object.prototype.hasOwnProperty.call(objet, 'diplome'),
    ) || false
  );
}
