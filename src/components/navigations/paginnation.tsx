'use client';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { scrappingDataStorage } from '@/interfaces/scrapping';
import { pageType } from '@/interfaces/services';
import cn from '@/utils/cn';
import { Pagination as PaginationUi } from '@nextui-org/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { CgArrowRight } from 'react-icons/cg';
import Button from '../buttons';

const Pagination = ({
  page,
  className,
  skippedCandidate,
  setIsLoadingPage,
  data,
  pageType,
  lastPage,
  nPage,
  isAsync = false,
}: {
  page: string;
  className?: string;
  nPage: number;
  pageType: pageType;
  lastPage: boolean;
  setIsLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
  data?: scrappingDataStorage;
  isAsync: boolean;
  skippedCandidate: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {
    services: { scrappingSearch, scrappingCV },
    actions: { setSearch },
  } = useAppContext();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const getRoutePath = useCallback(
    (page: string) => {
      const pathSegments = pathName.split('/');

      if (pathSegments.length > 3) {
        pathSegments[3] = page;
      } else {
        pathSegments.push(page);
      }

      const newPathName = pathSegments.join('/');
      return `${newPathName}${searchParams.size !== 0 ? `?${searchParams.toString()}` : ''}`;
    },
    [pathName, searchParams],
  );

  const setPage = useCallback(
    (v: number) => {
      if (!isAsync) {
        setIsLoadingPage(true);
      }
      const nextRoute = getRoutePath(v.toString());
      router.prefetch(nextRoute);

      setTimeout(() => {
        router.push(nextRoute);
      }, 500);
    },
    [getRoutePath, isAsync, router, setIsLoadingPage],
  );

  const currentPage = useMemo(() => {
    return Number.parseInt(page);
  }, [page]);

  const handleFetchNext: React.MouseEventHandler<HTMLSpanElement> = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!data) {
        return;
      }
      setLoading(true);
      const scrapping = {
        ...data.search,
        start: (data?.start ?? 0) + (data?.index ?? 50) + 1,
      };

      const request = pageType === 'pro' ? scrappingSearch : scrappingCV;
      const { err: error, res } = await request(scrapping as any);
      if (error) {
        throw new ClientException(
          500,
          'Une erreur est survenue, veuillez réessayer plus tard',
        );
      }

      setSearch({
        profils: (res?.links as any) || [],
        pageType,
        search: scrapping,
      } as any);
      setLoading(false);

      if (skippedCandidate) {
        window.location.replace(getRoutePath(nPage.toString()));
        return;
      }
      router.push(getRoutePath((nPage + 1).toString()));
    },
    [
      data,
      getRoutePath,
      nPage,
      pageType,
      router,
      scrappingCV,
      scrappingSearch,
      setSearch,
      skippedCandidate,
    ],
  );

  return (
    data && (
      <div
        className={cn(
          'w-full flex flex-row justify-center pr-[3.65rem] mt-3 mb-0',
          className,
        )}
      >
        <PaginationUi
          total={nPage}
          initialPage={currentPage}
          onChange={setPage}
          isDisabled={loading}
          classNames={{
            wrapper: 'md:space-x-[0.185rem] lg:space-x-1 xl:space-x-1.5',
            item: 'bg-content cursor-pointer border-1 !text-p2 border-transparent shadow-border hover:text-white hover:!bg-primary hover:border-foreground/40 md:h-7 lg:h-8 xl:h-10 md:w-8 lg:w-9 xl:w-11 flex rounded-lg',
            cursor:
              'bg-gradient-to-bl mr-2 cursor-default-child !text-p2 from-primary to-secondary/90 text-white border-1 border-foreground/30 md:h-7 lg:h-8 xl:h-10 md:w-8 lg:w-9 xl:w-11 flex rounded-lg',
          }}
        />
        {isAsync && data && !lastPage && (
          <Button
            onClick={handleFetchNext}
            fullWidth={true}
            defaultLoading={false}
            isLoading={loading}
            className="min-w-0 md:h-7 lg:h-8 xl:h-10 !md:w-7 !lg:w-9 !xl:w-11 md:ml-2 lg:ml-2.5 xl:ml-3 px-1 xl:px-1.5 shadow-border bg-content border-1 border-transparent hover:border-foreground/40 overflow-hidden rounded-lg flex justify-center items-center"
          >
            <CgArrowRight
              className={cn('w-full h-full text-foreground/60', {
                hidden: loading,
              })}
            />
          </Button>
        )}
      </div>
    )
  );
};
export default Pagination;
