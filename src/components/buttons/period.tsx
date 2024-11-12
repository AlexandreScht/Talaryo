'use client';

import { billPeriod } from '@/interfaces/payement';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import Button from '.';

const PeriodSelector = ({
  periodsDesired,
  defaultPeriod,
}: {
  periodsDesired: billPeriod[];
  defaultPeriod?: billPeriod;
}) => {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const { period } = useMemo(
    () => (Object.fromEntries(searchParams) as { period: billPeriod }) || {},
    [searchParams],
  );

  const handleChoose = useCallback(
    (period: billPeriod) => {
      router.push(createRouteWithQueries(path, { period: period }));
    },
    [path, router],
  );

  useEffect(() => {
    if (!period) {
      if (!defaultPeriod) {
        router.push(
          createRouteWithQueries(path, { period: periodsDesired[0] }),
        );
      } else {
        router.push(createRouteWithQueries(path, { period: defaultPeriod }));
      }
    }
  }, [defaultPeriod, path, period, periodsDesired, router]);

  return (
    !!periodsDesired?.length && (
      <nav className="bg-asset/30 p-1 xl:py-1.5 xl:px-2 flex space-x-0.5 flex-row h-fit rounded-lg shadow-md shadow-background">
        {periodsDesired.map((periodDesired) => (
          <Button
            onClick={() => handleChoose(periodDesired)}
            key={periodDesired}
            className={cn(
              'rounded-lg bg-transparent !text-h4 border-1 font-medium border-transparent w-24 py-1.5 lg:w-28 lg:py-2 xl:py-2.5 h-fit text-foreground/80',
              {
                'bg-background text-foreground/90 shadow-sm shadow-shadow':
                  period === periodDesired,
              },
            )}
          >
            {periodDesired}
          </Button>
        ))}
      </nav>
    )
  );
};

export default PeriodSelector;
