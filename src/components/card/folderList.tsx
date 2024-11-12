'use client';

import { foldersChoose, foldersList } from '@/interfaces/services';
import { useCallback } from 'react';

const FolderList = ({
  className,
  folder,
  folderType,
  setFolderProps,
}: {
  className: string;
  folder: foldersList;
  folderType: 'favoris' | 'search';
  setFolderProps: React.Dispatch<
    React.SetStateAction<foldersChoose | undefined>
  >;
}) => {
  const handleChoose = useCallback(() => {
    if (!folder.id) {
      return;
    }

    setFolderProps({ folderType, formValues: undefined, folder });
  }, [folder, folderType, setFolderProps]);

  return (
    <div onClick={() => handleChoose()} className={className}>
      <span className="flex-1 !text-p2 text-ellipsis line-clamp-1">
        {folder.name}
      </span>
      <span className="text-special !text-p2  font-bold mr-1 ml-5 group-hover:text-white/90">
        {Number.parseInt(folder?.itemsCount || '0') > 99
          ? '99+'
          : folder.itemsCount}
      </span>
    </div>
  );
};

export default FolderList;
