'use client';

import Button from '@/components/buttons';
import useAppContext from '@/hooks/providers/AppProvider';
import { mainParams } from '@/interfaces/components';
import { pageType } from '@/interfaces/services';
import serializeSearchParams from '@/libs/serializeSearchParams';
import routes from '@/routes';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const TableError = ({
  favPage,
  search,
  pageType,
}: {
  favPage?: boolean;
  search?: mainParams;
  pageType?: pageType;
}) => {
  const router = useRouter();

  const {
    actions: { resetSearch },
  } = useAppContext();

  const handleFavoris = useCallback(() => {
    router.push(routes.pages.favoris());
  }, [router]);

  const handleNewSearch = useCallback(() => {
    const isPro = pageType === 'pro';
    const platforms = isPro
      ? Array.isArray(search?.platform)
        ? search?.platform
        : [search?.platform]
      : [];
    const searches = isPro
      ? { ...search, platform: serializeSearchParams(platforms as string[]) }
      : { ...search };

    resetSearch(pageType as pageType);
    router.push(
      isPro
        ? routes.pages.pro(searches as any)
        : routes.pages.cv(searches as any),
    );
  }, [search, resetSearch, pageType, router]);

  return favPage ? (
    <div className="w-full h-full">
      <div className="bg-content h-full pb-[7%] w-full flex flex-col justify-center items-center rounded-xl">
        <h1 className="text-foreground/90 text-center text-h2 font-bold">
          Aucun favori enregistré
        </h1>
        <span className="text-foreground/70 text-p1 mt-5">
          Veuillez enregistrer des favoris dans ce dossier pour les visualiser
        </span>
        <div className="flex flex-row mt-8 space-x-5">
          <Button
            onClick={handleFavoris}
            className="bg-gradient-to-bl from-primary md:mt-0 lg:mt-3 to-secondary text-white/90 md:py-3 md:px-4 lg:py-4 lg:px-5 xl:py-[1.35rem] xl:px-6 text-p1 font-medium rounded-md"
          >
            Mes favoris
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-full">
      <div className="bg-content h-full pb-[7%] w-full flex flex-col justify-center items-center rounded-xl">
        <h1 className="text-foreground/90 text-center text-h2 font-bold">
          Aucun résultat :(
        </h1>
        <span className="text-foreground/70 text-p1 mt-5">
          Oups ! Il semblerait que votre recherche ait rencontré un petit souci
        </span>
        <span className="text-foreground/70 text-p1 my-1">
          Veuillez réessayer
        </span>
        <p className="text-foreground/70 text-p1">
          Si le problème persiste, veuillez nous contacter
        </p>
        <div className="flex flex-row mt-8 space-x-5">
          <Button
            onClick={handleNewSearch}
            className="bg-gradient-to-bl from-primary md:mt-0 lg:mt-3 to-secondary text-white/90 md:py-3 md:px-4 lg:py-4 lg:px-5 xl:py-[1.35rem] xl:px-6 text-p1 font-medium rounded-md"
          >
            Nouvelle recherche
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableError;
