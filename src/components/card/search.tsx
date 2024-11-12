'use client';

import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { searchFoldersType, searches } from '@/interfaces/searches';
import { pageType } from '@/interfaces/services';
import serializeSearchParams from '@/libs/serializeSearchParams';
import routes from '@/routes';
import cn from '@/utils/cn';
import { useIntersection } from '@mantine/hooks';
import { ScrollShadow, Skeleton } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineFilePdf } from 'react-icons/ai';
import { FiTrash2 } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';
import SearchBar from '../inputs/search';

const SearchCard = ({
  children,
  className,
  cannotSearch = false,
  cannotClose = false,
  setFoldersList,
  foldersProps,
  totalFetched,
  pageType,
}: {
  children?: React.ReactNode;
  className?: string;
  cannotSearch?: boolean;
  cannotClose?: boolean;
  setFoldersList?: React.Dispatch<React.SetStateAction<searchFoldersType[]>>;
  foldersProps?: searchFoldersType;
  totalFetched: number;
  pageType?: pageType;
}) => {
  const lastItemsFetched = useRef<HTMLDivElement>(null);
  const [textValue, setTextValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchesList, setSearchesList] = useState<searches[]>([]);
  const [total, setTotal] = useState<number>(totalFetched ?? 0);
  const [active, setActive] = useState<boolean>(false);
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout>();

  const {
    services: { getSearches, removeSearch },
  } = useAppContext();

  const fetchingData = useCallback(
    async ({ page, search, limit }: { page?: number; search?: string; limit?: number }, replace?: boolean) => {
      setLoading(true);
      const { err, res } = await getSearches({
        page,
        limit,
        searchFolderName: search,
        ...(pageType ? { isCv: pageType === 'cv' } : {}),
      });

      if (err) {
        throw new ClientException(500, 'Une erreur est survenue, veuillez réessayer plus tard');
      }
      const { results: searches, total = 0 } = res || { results: [], total: 0 };

      setLoading(false);
      setTotal(Number.parseInt(String(total), 10));
      if (replace) {
        setSearchesList([...searches] as any);
        return;
      }
      setSearchesList(prev => [...prev, ...searches] as any);
    },
    [getSearches, pageType],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setTextValue(value);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (!active) {
          return;
        }

        setSearch(value);
        fetchingData({ page: 1, search: value }, true);
      }, 250);
    },
    [active, fetchingData],
  );

  useEffect(() => {
    if (cannotClose) {
      setActive(true);
      if (!searchesList?.length && totalFetched > 0) {
        fetchingData({ page: 1, search }, true);
      }
    }
  }, [cannotClose, fetchingData, search, searchesList?.length, totalFetched]);

  const handleToggleClick = useCallback(() => {
    setActive(prev => !prev);
    if (!searchesList?.length && totalFetched > 0) {
      fetchingData({ page: 1, search }, true);
    }
  }, [fetchingData, search, searchesList?.length, totalFetched]);

  const handleDelete = useCallback(
    async (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string) => {
      e.stopPropagation();
      const { err, res } = await removeSearch(Number.parseInt(id, 10));
      if (err || !res) {
        throw new ClientException(500, 'Error on removing favorite folder');
      }
      setSearchesList(prev => prev.filter(v => v.id !== id));
      if (foldersProps?.id && setFoldersList) {
        setFoldersList(prev => prev.map(v => (v.id === foldersProps.id ? { ...v, itemsCount: String(Number.parseInt(v.itemsCount) - 1) } : v)));
      }
    },
    [foldersProps?.id, removeSearch, setFoldersList],
  );

  const handleChoiceClick = async (searchStringifyQueries: string, isCv: boolean) => {
    try {
      const searchQueries: Record<string, string> = JSON.parse(searchStringifyQueries);
      const platforms = Array.isArray(searchQueries.platform) ? searchQueries.platform : [searchQueries.platform];
      const searches = {
        ...searchQueries,
        platform: serializeSearchParams(platforms),
      };
      const routePusher = isCv ? routes.pages.cv : routes.pages.pro;
      router.push(routePusher(searches as any));
    } catch (error) {
      throw new ClientException(500, 'Une erreur est survenue, veuillez réessayer plus tard');
    }
  };

  const showList = useMemo(() => {
    return totalFetched > 0;
  }, [totalFetched]);

  const { ref, entry } = useIntersection({
    root: lastItemsFetched.current,
    threshold: 1,
  });

  useEffect(() => {
    if (!entry?.isIntersecting === false && searchesList?.length && searchesList.length !== total) {
      fetchingData({ page: Math.ceil(searchesList.length / 5) + 1, search });
    }
  }, [entry?.isIntersecting, getSearches, total, searchesList.length, search, fetchingData]);

  return (
    <div
      className={cn('w-full max-h-8 transition-all overflow-hidden flex flex-col relative', {
        'max-h-full flex-1': active && showList,
      })}
    >
      <div className={cn(className, 'flex items-center flex-row')}>
        <div className={cn('w-full', { 'flex-1': showList })}>{children}</div>
        {showList && !cannotClose && (
          <div
            className={cn('w-5 h-5 xl:w-7 xl:h-7 text-asset hover:text-secondary cursor-pointer rounded-lg transition-transform duration-200', {
              'rotate-180': active,
            })}
            onClick={handleToggleClick}
          >
            <MdKeyboardArrowDown className="w-full h-full" />
          </div>
        )}
      </div>

      <div
        className={cn('w-full transition-all max-h-0 overflow-hidden flex flex-col', {
          'lg:mt-1 max-h-[50vh]': active && showList,
        })}
      >
        {!cannotSearch && <SearchBar value={textValue} handleSearch={handleSearch} />}

        <ScrollShadow
          size={cannotClose ? 10 : 25}
          orientation="vertical"
          className="w-auto flex-1 mt-1 pb-2 space-y-1 xl:space-y-2 pr-2 custom-scrollbar"
        >
          {searchesList.map((v, i) => (
            <div
              onClick={() => handleChoiceClick(v.searchQueries, v.isCv)}
              key={i}
              ref={i === searchesList.length - 2 ? ref : null}
              className="w-full group flex flex-row md:px-0.5 lg:px-1 justify-between items-center py-1 border-b-1 transition-transform duration-150 cursor-pointer border-asset/40 hover:translate-x-[1.8%] lg:hover:translate-x-[2.5%] overflow-hidden"
            >
              <div className="flex flex-col w-full pr-2.5 lg:pr-5 overflow-hidden group:text-ellipsis">
                <h4 className="line-clamp-1 block text-p3 truncate text-foreground/90">{v.name}</h4>
                <span className="line-clamp-1 block text-p4 truncate text-asset">{v?.society}</span>
              </div>

              <div className="relative">
                {v?.isCv && (
                  <div className="absolute top-1/2 opacity-60 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 -translate-y-1/2 group-hover:opacity-0">
                    <AiOutlineFilePdf className="w-full h-full" />
                  </div>
                )}
                <div
                  onClick={e => handleDelete(e, v.id)}
                  className="text-[#508CFB] md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 hover:cursor-pointer transition-transform duration-150 opacity-0 group-hover:opacity-100 group-hover:-translate-x-[1.8%] lg:group-hover:-translate-x-2.5 hover:text-errorTxt hover:scale-110"
                >
                  <FiTrash2 className="w-full h-full" />
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="w-full h-fit pb-0.5">
              <div className="w-full border-b-1 min-h-0 h-fit border-b-load/90 bg-load/20 flex flex-col px-1">
                <Skeleton className="rounded w-14 mt-0.5 lg:mt-1 h-2.5 lg:h-3.5" />
                <Skeleton className="rounded w-24 h-2 lg:h-3 my-1.5" />
              </div>
            </div>
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};

export default SearchCard;
