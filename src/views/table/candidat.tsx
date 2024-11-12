'use client';

import Pagination from '@/components/navigations/paginnation';
import ProfilsTable from '@/components/tables/results';
import useAppContext from '@/hooks/providers/AppProvider';
import useSocketContext from '@/hooks/providers/socketProvider';
import {
  initializedStorage,
  scrappingCVProps,
  serializeCandidateProps,
} from '@/interfaces/scrapping';
import { pageType } from '@/interfaces/services';
import { useEffect, useMemo, useState } from 'react';

const CandidatTable = ({
  favPage,
  page,
  pageType,
}: {
  pageType?: pageType;
  favPage?: initializedStorage;
  page: string;
}) => {
  const [fetchedProps, setFetchedProps] = useState<initializedStorage>();
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(!!favPage);
  const {
    stores: { getSearch },
  } = useAppContext();
  const { socketListener } = useSocketContext();

  useEffect(() => {
    setFetchedProps(
      favPage ? favPage : (getSearch(pageType) as initializedStorage),
    );
  }, [favPage, getSearch, page, pageType]);

  useEffect(() => {
    if (socketListener?.length) {
      const profile = socketListener?.find((v) => v.name === 'cv_event')
        ?.value as scrappingCVProps | undefined;

      if (pageType === 'cv') {
        setFetchedProps((prev) => {
          const { pages = [], data } =
            prev || (getSearch('cv') as initializedStorage) || {};

          const updatedPages = profile?.pdf
            ? [
                ...new Map(
                  pages
                    .concat(profile)
                    .map((item) => [(item as scrappingCVProps).pdf, item]),
                ).values(),
              ]
            : pages;

          return {
            pages: updatedPages,
            data: {
              ...data,
              inStream: !profile?.isEnd,
              total: profile ? data.total : Math.max(data.total - 1, 0),
            },
          };
        });
      }
    }
  }, [getSearch, pageType, socketListener]);

  const {
    nPage = 1,
    list,
    lastPage,
    total = 0,
    search,
    skippedCandidate,
  } = useMemo((): serializeCandidateProps => {
    setIsLoadingPage(false);
    if (!fetchedProps) {
      return {
        nPage: 0,
        list: [],
        lastPage: true,
        total: 0,
        search: {},
        skippedCandidate: false,
      };
    }
    const { pages = [], data } = fetchedProps;

    const limit = 10;
    const lastPage =
      pages.length >= (data?.total || 0) || data?.inStream === true;
    const nPage =
      !!favPage && data.nPages ? data.nPages : Math.ceil(pages.length / limit);
    const skippedCandidate = nPage * limit > pages.length;
    const startIdx = (Number(page) - 1) * limit;
    const list = favPage ? pages : pages.slice(startIdx, startIdx + limit);

    return {
      nPage,
      list,
      lastPage,
      search: data?.search,
      total: data?.total,
      skippedCandidate,
    };
  }, [favPage, fetchedProps, page]);

  return (
    fetchedProps && (
      <section className="w-full flex flex-col items-center md:mt-5 lg:mt-7 xl:mt-8">
        <div className="w-full relative">
          <ProfilsTable
            list={list}
            pageType={pageType}
            isLoadingPage={isLoadingPage}
            search={search}
            total={total}
            error={!fetchedProps?.pages?.length}
            favPage={favPage?.pages}
          />
          {fetchedProps?.data && (
            <Pagination
              skippedCandidate={skippedCandidate}
              nPage={nPage}
              setIsLoadingPage={setIsLoadingPage}
              lastPage={lastPage}
              pageType={pageType as pageType}
              page={page}
              data={fetchedProps.data}
              isAsync={!favPage}
            />
          )}
        </div>
      </section>
    )
  );
};

export default CandidatTable;
