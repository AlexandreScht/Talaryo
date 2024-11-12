'use client';
import Chip from '@/components/card/chip';
import { OnOutsideClick } from '@/hooks/providers/ActionProvider';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DatePicker = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const scrollableDivRef = useRef(null);
  const [date, setDate] = useState<number[]>([new Date().getFullYear()]);
  const acceptYears = useRef<(number | null | undefined)[]>([
    null,
    ...Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - (i + 1)),
    undefined,
  ]);
  const [displayDate, setDisplayDate] = useState<(number | null | undefined)[]>(
    acceptYears.current.slice(0, 3),
  );
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { date } = Object.fromEntries(searchParams) || {};
    if (date) {
      setDate([date, new Date().getFullYear()] as number[]);
    }
  }, [searchParams]);

  const handleOpen = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  const handleScroll = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const delta = event.deltaY;
      setDisplayDate((prevDates) => {
        const currentFirstIndex = acceptYears.current.indexOf(prevDates[0]);
        const currentLastIndex = acceptYears.current.indexOf(
          prevDates[prevDates.length - 1],
        );

        if (delta > 0 && currentLastIndex < acceptYears.current.length - 1) {
          const nextIndex = currentFirstIndex + 1;
          if (nextIndex === acceptYears.current.length - 2) {
            return acceptYears.current.slice(nextIndex);
          }
          return acceptYears.current.slice(nextIndex, nextIndex + 3);
        } else if (delta < 0 && currentFirstIndex > 0) {
          const prevIndex = currentFirstIndex - 1;
          if (prevIndex === 0) {
            return acceptYears.current.slice(0, 2);
          }
          return acceptYears.current.slice(prevIndex, prevIndex + 3);
        }

        return prevDates;
      });
    },
    [],
  );

  const handleRemoveItems = useCallback(() => {
    setDate((v) => [v[1]]);
    const oldParams = Object.fromEntries(searchParams);
    delete oldParams.date;
    router.push(createRouteWithQueries(path, { ...oldParams }));
  }, [path, router, searchParams]);

  const [dateA, dateB, dateC] = useMemo(() => displayDate, [displayDate]);

  const handleChooseDate = useCallback(() => {
    setDate([dateB, new Date().getFullYear()] as number[]);
    const oldParams = Object.fromEntries(searchParams);
    router.push(
      createRouteWithQueries(path, { ...oldParams, date: dateB as number }),
    );
  }, [dateB, path, router, searchParams]);

  const handleOutsideClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="grid grid-cols-1 w-full">
      <OnOutsideClick
        onClickOutside={handleOutsideClick}
        className="h-full w-full"
      >
        <div
          onClick={handleOpen}
          className="md:py-[0.3rem] h-full relative xl:py-[0.36rem] w-full z-50 md:pl-1.5 lg:pl-2.5 flex flex-wrap items-center !rounded-lg bg-content cursor-pointer shadow-border hover:border-gradient"
        >
          <Chip {...(date.length > 1 ? { handleRemoveItems } : {})}>
            <span className="text-white !text-p3">{date.join(' - ')}</span>
          </Chip>
          <span className="ml-auto mr-2.5 text-p4 text-foreground/60">
            Année des CV
          </span>
          {isOpen && (
            <div
              ref={scrollableDivRef}
              onWheel={handleScroll}
              onClick={handleChooseDate}
              className="w-full absolute bg-content flex flex-col text-center py-1 !text-p3 rounded-b-lg left-0 top-full z-50 shadow-border space-y-1.5"
            >
              <span className="relative w-full text-foreground/80">
                {dateA}
                <div
                  className={cn(
                    'absolute top-0 left-0 w-full h-full bg-gradient-to-b from-content/75 to-transparent',
                    { hidden: !dateA },
                  )}
                ></div>
              </span>
              <span className="text-foreground font-medium scale-105">
                {dateB}
              </span>
              <span className="relative w-full text-foreground/80">
                {dateC}
                <div
                  className={cn(
                    'absolute top-0 left-0 w-full h-full bg-gradient-to-t from-content/75 to-transparent',
                    { hidden: !dateC },
                  )}
                ></div>
              </span>
            </div>
          )}
        </div>
      </OnOutsideClick>
    </div>
  );
};

export default DatePicker;
