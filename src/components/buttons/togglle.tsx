'use client';

// import useAnalyticsContext from '@/hooks/providers/AnalyticsProvider';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import Button from '.';

const ToggleButton = ({
  params,
  children,
  value,
  classNames,
}: {
  params: string;
  children: React.ReactNode;
  value: undefined | true;
  classNames?: string;
}) => {
  // const { trackGAEvent } = useAnalyticsContext();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const handleChoose = useCallback(() => {
    // trackGAEvent(
    //   'Click',
    //   `${path === '/cv' ? 'cv' : 'reseaux'} - ${params}`,
    //   `${value}`,
    //   1,
    // );

    const oldParams = Object.fromEntries(searchParams);
    if (!value) {
      delete oldParams[params];
      router.push(createRouteWithQueries(path, { ...oldParams }));
      return;
    }
    router.push(
      createRouteWithQueries(path, { ...oldParams, [params]: value }),
    );
  }, [params, path, router, searchParams, value]);

  const [actualParam, actualValue] = useMemo(
    () => [
      Object.fromEntries(searchParams)[params] || 'undefined',
      value ? value.toString() : 'undefined',
    ],
    [params, searchParams, value],
  );

  return (
    <Button
      onClick={handleChoose}
      className={cn(
        'rounded-md bg-transparent !text-p3 border-1 w-20 py-[0.425rem] lg:w-24 xl:w-28 lg:py-2 h-fit text-foreground/80 border-asset/60',
        classNames,
        {
          'bg-primary text-white border-secondary/60':
            actualParam === actualValue,
        },
      )}
    >
      {children}
    </Button>
  );
};

export default ToggleButton;
