/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import data from '@/assets/data.json';
import { OnOutsideClick } from '@/hooks/providers/ActionProvider';
import type { InputProps } from '@/interfaces/components';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import normalizedChart from '@/utils/normalizedChart';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Chip from '../card/chip';

const Input = ({ className, maxItems, label, searchParams }: InputProps) => {
  const { props, params } = searchParams;
  const { theme } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const [items, setItems] = useState<string[]>(
    InitialItems((props as any)[params]),
  );
  const [active, setActive] = useState<boolean>(!!(props as any)[params]);
  const [value, setValue] = useState<string>('');
  const wrapperScroll = useRef(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if ((props as any)[params]) {
      setActive(!!(props as any)[params]);
      setItems(InitialItems((props as any)[params]));
    }
  }, [params, props]);

  const suggestion = useMemo(() => {
    if ((params === 'fn' || params === 'sector') && value.length > 0) {
      const search = normalizedChart(value);

      const getTopSuggestions = (items: any[], searchKey: string) => {
        return items
          .sort((a, b) => (a.S || 1) - (b.S || 1))
          .filter((item) => {
            const searchValue = item[searchKey];
            const normalizedValue = normalizedChart(searchValue);
            if (params === 'fn') {
              return (
                normalizedValue.startsWith(search) &&
                !props.fn
                  ?.split(',')
                  .map((v) => normalizedChart(v))
                  ?.includes(normalizedValue)
              );
            }
            console.log(normalizedValue);

            return normalizedValue.startsWith(search);
          })
          .slice(0, 5)
          .map((item) => item[searchKey]);
      };

      const itemSuggested =
        params === 'fn'
          ? getTopSuggestions(data.jobNames, 'H')
          : data.sector
              .filter((sector) => {
                const normalizedSector = normalizedChart(sector);
                return (
                  normalizedSector.startsWith(search) &&
                  !props.sector
                    ?.split(',')
                    .map((v) => normalizedChart(v))
                    ?.includes(normalizedSector)
                );
              })
              .slice(0, 5);

      if (itemSuggested.length > 0) {
        const highlightMatch = (str: string) => {
          const index = normalizedChart(str).indexOf(search);
          if (index === -1) return str;
          return (
            str.substring(0, index) +
            value +
            str.substring(index + value.length)
          );
        };

        return itemSuggested.map(highlightMatch);
      }
    }
  }, [params, props.fn, props.sector, value]);

  const handleRemoveItems = useCallback(
    (removeItem: string) => {
      const itemsList = items.filter((item) => item !== removeItem);
      setItems(itemsList);
      if (!itemsList.length) {
        setActive(false);
        delete (props as any)[params];
        router.push(createRouteWithQueries(path, props as any));
      } else {
        router.push(
          createRouteWithQueries(path, { ...props, [params]: itemsList }),
        );
      }
    },
    [items, props, params, router, path],
  );

  const handleEditItems = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
      const editList = [
        ...items.slice(0, i),
        e.target.value,
        ...items.slice(i + 1),
      ];
      setItems(editList);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        router.push(
          createRouteWithQueries(path, { ...props, [params]: editList }),
        );
      }, 1000);
    },
    [items, params, path, props, router],
  );

  const handleMouseScroll = useCallback(
    (event: React.WheelEvent<HTMLDivElement>): void => {
      const wrapperDiv = wrapperScroll.current;
      if (!wrapperDiv) {
        return;
      }

      (wrapperDiv as HTMLDivElement).scrollLeft += event.nativeEvent.deltaY;
    },
    [],
  );

  useEffect(() => {
    const wrapperDiv = wrapperScroll.current;
    if (!wrapperDiv) {
      return;
    }

    (wrapperDiv as HTMLDivElement).scrollLeft += (
      wrapperDiv as HTMLDivElement
    ).scrollWidth;
  }, [items]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        event.key === 'Enter' &&
        !maxItems &&
        value &&
        !items.find((v) => v === value)
      ) {
        setItems((prev) => [...prev, value]);
        router.push(
          createRouteWithQueries(path, {
            ...props,
            [params]: [...items, value],
          }),
        );
        setValue('');
      }

      if (!!suggestion && (event.key === 'ArrowRight' || event.key === 'Tab')) {
        event.preventDefault();
        setValue(suggestion[0]);
      }
    },
    [items, maxItems, params, path, props, router, suggestion, value],
  );

  const handleChooseSuggest = useCallback(
    (v: string) => {
      setItems((prev) => [...prev, v]);
      router.push(
        createRouteWithQueries(path, { ...props, [params]: [...items, v] }),
      );
      setValue('');
    },
    [items, params, path, props, router],
  );

  const handleInputFocus = useCallback(() => {
    setActive(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setActive(items.length > 0 || !!value);
  }, [items.length, value]);

  const handleOutsideClick = useCallback(() => {
    if (!maxItems && value && !items.find((v) => v === value)) {
      setItems((prev) => [...prev, value]);
      router.push(
        createRouteWithQueries(path, { ...props, [params]: [...items, value] }),
      );
      setValue('');
    }
  }, [items, maxItems, params, path, props, router, value]);

  return (
    <div className="grid grid-cols-1 w-full">
      <OnOutsideClick onClickOutside={handleOutsideClick}>
        <div
          onWheel={handleMouseScroll}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={cn(
            'md:py-[0.3rem] xl:py-[0.36rem] w-full md:pl-0.5 lg:pl-1 md:pr-1 lg:pr-1.5 flex flex-wrap relative !rounded-lg bg-content cursor-pointer shadow-border hover:border-gradient',
            className,
          )}
        >
          <span
            className={cn(
              'absolute inset-y-0 !text-foreground/70 flex items-center ml-2 rounded-lg transition-all duration-150 text-p3',
              {
                '-translate-y-[60%] -translate-x-[10%] scale-80 h-fit bg-gradient-to-b from-background to-content':
                  active,
              },
            )}
          >
            {label}
          </span>
          <ScrollShadow
            hideScrollBar
            ref={wrapperScroll}
            orientation="horizontal"
            size={30}
            className="w-full max-w-full min-h-0 relative flex flex-row items-center space-x-2.5 overflow-x-hidden overflow-y-visible px-1 py-0.5"
          >
            {items.map((v, i) => (
              <Chip handleRemoveItems={() => handleRemoveItems(v)} key={i}>
                <p className="relative w-fit py-0 text-p3 text-transparent inset-y-0">
                  {v}
                  <input
                    value={v}
                    maxLength={50}
                    onChange={(e) => handleEditItems(e, i)}
                    className={cn(
                      'w-full text-white/90 !text-p3 outline-none bg-transparent inset-y-0 absolute left-0',
                      {
                        'text-white': theme === 'light',
                      },
                    )}
                  />
                </p>
              </Chip>
            ))}
            <div className="relative flex-1 min-w-[25%]">
              {!!suggestion?.length && (
                <p className="absolute whitespace-nowrap left-0 top-0 text-p2 py-[0.1rem] lg:py-[0.135rem] lg:px-1 xl:px-1.5 text-foreground/60 h-full">
                  {suggestion[0]}
                </p>
              )}

              <input
                type="text"
                maxLength={50}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-p2 py-[0.1rem] relative lg:py-[0.135rem] text-foreground/80 bg-transparent outline-none z-20 lg:px-1 xl:px-1.5"
                onKeyDown={handleKeyPress}
              />
            </div>
          </ScrollShadow>
          {!!suggestion?.length && (
            <div className="absolute rounded-b-xl left-0 top-full bg-background shadow-border w-full max-h-48 z-[100]">
              <div className="relative rounded-b-xl flex flex-col pb-1.5 px-2 w-full h-full space-y-1 top-0 left-0 bg-content/50">
                {suggestion.map((j, i) => (
                  <span
                    onClick={() => handleChooseSuggest(j)}
                    className="py-1 hover:cursor-pointer hover:bg-content text-foreground/80 hover:text-foreground"
                    key={i}
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </OnOutsideClick>
    </div>
  );
};

export default Input;

function InitialItems(key?: string) {
  return key ? key.split(',') : [];
}
