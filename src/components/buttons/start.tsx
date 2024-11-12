'use client';
import data from '@/assets/data.json';
import Button from '@/components/buttons';

// import useAnalyticsContext from '@/hooks/providers/AnalyticsProvider';
import useAppContext from '@/hooks/providers/AppProvider';
import { mainParams, StartButtonProps } from '@/interfaces/components';
import { candidateDataProps, scrappingInfos } from '@/interfaces/scrapping';
import routes from '@/routes';
import normalizedChart from '@/utils/normalizedChart';
import { ErrorToast, InfoToast } from '@/utils/toaster';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const StartSearch = ({
  children,
  className,
  searchParams,
  page,
  training,
}: StartButtonProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  // const { trackGAEvent } = useAnalyticsContext();

  const {
    services: { scrappingSearch, scrappingCV, trainingIA },
    actions: { setSearch, isSameSearch },
  } = useAppContext();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(async () => {
      if (
        (page === 'pro' && !searchParams.platform) ||
        !Object.entries(searchParams)
          .filter(([key]) => key !== 'matching' && key !== 'date')
          .some(([, value]) => value !== undefined && value !== null)
      ) {
        InfoToast({
          text: `Veuillez remplir ${page === 'pro' ? 'le champ "plateforme"' : 'au moins un champ'} `,
        });
        return;
      }

      const scrapping = {} as Record<string, string | string[] | undefined>;

      scrapping.platform =
        searchParams?.platform
          ?.split(',')
          .map((v) => v.toString().split(':')[2]) || undefined;

      if (
        !training &&
        isSameSearch({
          search: {
            ...searchParams,
            platform: scrapping?.platform as any,
          } as any,
          page,
        })
      ) {
        return router.push(
          page === 'pro'
            ? routes.pages['candidats'].reseauxResult([1])
            : routes.pages['candidats'].cvResult([1]),
        );
      }
      Object.entries(searchParams).forEach(([key, value]) => {
        if (key === 'platform' || !value) {
          return;
        }
        const arrValues = value.toString().split(',');
        scrapping[key] = arrValues.length > 1 ? arrValues : value.toString();
      });

      setLoading(true);
      if (page === 'cv') {
        delete scrapping.platform;
      }
      // Object.entries(scrapping).forEach(([key, value]) => {
      //   trackGAEvent('Send', `${page} - Recherche`, `${key} - ${value}`, 1);
      // });

      if (scrapping?.fn && scrapping.fn?.length) {
        scrapping.fn = serializeFunctionSex(
          Array.isArray(scrapping.fn) ? scrapping.fn : [scrapping.fn],
        );
      }

      const request = training
        ? trainingIA
        : page === 'pro'
          ? scrappingSearch
          : scrappingCV;

      const { err: error, res } = (await request(scrapping as any)) as {
        err?: string;
        code: string;
        res?: {
          data: Omit<candidateDataProps, 'inStream'>;
          links: scrappingInfos[];
        };
      };

      setLoading(false);
      if (error || !res) {
        return ErrorToast({ error: error });
      }

      setSearch({
        training,
        profils: { data: res?.data || {}, res: res?.links || [] },
        pageType: page,
        search: {
          ...searchParams,
          platform: scrapping?.platform,
        } as mainParams,
        newSearch: true,
      });

      router.push(
        page === 'pro'
          ? routes.pages['candidats'].reseauxResult([1])
          : routes.pages['candidats'].cvResult([1]),
      );
      // router.push(
      //   training
      //     ? routes.pages.trainIa({ link: res?.res[0].link || 'none' })
      //     : page === 'pro'
      //       ? routes.pages['candidats'].reseauxResult([1])
      //       : routes.pages['candidats'].cvResult([1]),
      // );
    }, [
      isSameSearch,
      page,
      router,
      scrappingCV,
      scrappingSearch,
      searchParams,
      setSearch,
      training,
      trainingIA,
    ]);

  return (
    <Button onClick={handleClick} isLoading={loading} className={className}>
      {children}
    </Button>
  );
};

export default StartSearch;

function serializeFunctionSex(fn: string[]): string[] {
  const result: string[] = [];
  fn.forEach((s) => {
    if (s.toLocaleLowerCase().endsWith('(h/f)')) {
      const baseItem = s.slice(0, -5).toLowerCase();

      const jobName = data.jobNames.find((item) => {
        const { H } = item;
        return normalizedChart(s) === normalizedChart(H);
      });

      if (jobName && jobName.F) {
        result.push(jobName.H.slice(0, -5).toLowerCase());
        result.push(jobName.F.toLowerCase());
      } else {
        result.push(baseItem);
      }
    } else {
      result.push(s?.toLowerCase());
    }
  });

  return result.map((v) => v.trim());
}
