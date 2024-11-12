'use client';

import FoldersPopup from '@/components/card/foldersPopup';
import useAppContext from '@/hooks/providers/AppProvider';
import { mainParams } from '@/interfaces/components';
import { FolderAction, scrappingInfos } from '@/interfaces/scrapping';
import { pageType } from '@/interfaces/services';
import cn from '@/utils/cn';
import csvParse from '@/utils/csvParse';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import Button from '../../buttons';

const TableHeader = ({
  hasDiplome,
  total,
  pageType,
  search,
  favPage,
}: {
  pageType?: pageType;
  hasDiplome: boolean;
  total: number;
  search?: mainParams;
  favPage?: scrappingInfos[];
}) => {
  const [openFolder, setOpenFolder] = useState<false | 'search'>(false);
  const {
    stores: { getAllProfiles, getSearchName },
  } = useAppContext();
  const pathName = usePathname();

  const handleExportToCSV = useCallback(() => {
    const splitedPaths = pathName.split('/')[2] as pageType;
    const fileName = favPage ? splitedPaths : (getSearchName(search as any) as string);

    const profils = favPage ? favPage : (getAllProfiles(splitedPaths) as scrappingInfos[]);

    csvParse(
      {
        'Nom / Prénom': 'fullName',
        email: 'email',
        'Métier actuelle': 'currentJob',
        ...(hasDiplome ? { diplome: 'diplome' } : {}),
        'Entreprise actuelle': 'currentCompany',
        Description: 'resume',
        Liens: 'link',
      } as any,
      profils.filter(profile => 'link' in profile),
      fileName,
    );
  }, [favPage, getAllProfiles, getSearchName, hasDiplome, pathName, search]);

  const handleSaveSearch = useCallback(() => {
    setOpenFolder('search');
  }, []);

  const handleChildrenAction = useCallback((v: FolderAction) => {
    if (v.folderClosed) {
      setOpenFolder(false);
    }
  }, []);

  return (
    <div className="w-full flex flex-row space-x-4 !text-h3 text-foreground/90 md:mt-1.5 lg:mt-0 mb-3 xl:mb-4 px-2 -ml-2 relative">
      <div className="md:w-8 lg:w-10 xl:w-12"></div>
      <div className="md:w-[20%] lg:w-[19%]">Prénom / Nom </div>
      <div className={cn('w-[30%]', { 'w-1/4': !favPage })}>Fonction / {hasDiplome ? 'Diplome' : 'Entreprise'}</div>
      <div className="flex-1">Description</div>
      <div className="absolute md:-top-5 lg:top-0 right-0 lg:mb-0.5 xl:mb-0 flex items-end md:flex-col lg:flex-row inset-y-0 w-fit">
        <span className="text-left lg:mr-2 xl:mr-3 leading-none h-fit !text-i1 mb-0.5 lg:-mb-[0.1rem] xl:mb-0.5 lg:mt-auto text-foreground/75">
          {total ? (
            <>
              {total.toLocaleString()} {favPage ? (total === 1 ? 'favori' : 'favoris') : total === 1 ? 'résultat' : 'résultats'}
            </>
          ) : null}
        </span>
        <div className="flex flex-row justify-between md:space-x-2 lg:space-x-3">
          {!favPage && (
            <Button
              disabled={!!openFolder}
              onClick={handleSaveSearch}
              className="py-[0.315rem] xl:py-1.5 min-w-0  h-fit lg:px-2.5 xl:px-3 rounded lg:rounded-md bg-secondary !text-p3 text-white"
            >
              <span className="hidden xl:block -mr-[3px]">Enregistrer la</span>
              Recherche
              <FiSave className="lg:w-4 lg:h-4 xl:w-5 xl:h-5 block xl:hidden" />
            </Button>
          )}

          {pageType !== 'cv' && (
            <Button
              disabled={!!openFolder}
              onClick={handleExportToCSV}
              className="py-[0.315rem] xl:py-1.5 min-w-0 h-fit lg:px-2.5 xl:px-3 rounded lg:rounded-md bg-secondary !text-p3 text-white"
            >
              Exporter
            </Button>
          )}
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-[25vh]">
        <Popover isOpen={!!openFolder} backdrop="blur">
          <PopoverTrigger className="opacity-0">
            <div className="opacity-0"></div>
          </PopoverTrigger>
          <PopoverContent className="p-0 md:w-[19rem] lg:w-96">
            <FoldersPopup pageType={pageType as pageType} search={search} folderType="search" handleAction={handleChildrenAction} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TableHeader;
