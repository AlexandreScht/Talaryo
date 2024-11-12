/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Chip from '@/components/card/chip';
import { OnOutsideClick } from '@/hooks/providers/ActionProvider';
import useAppContext from '@/hooks/providers/AppProvider';
import useDebouncer from '@/hooks/useDebounce';
import type { SelectChoice, items, loc } from '@/interfaces/components';
import { Zone } from '@/interfaces/services';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import { Input, ScrollShadow } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { RxCrossCircled } from 'react-icons/rx';

const Localisation = ({
  classNames,
  label,
  message,
  placeholder,
  limit,
  searchParams,
  ...other
}: SelectChoice) => {
  const { props, params } = searchParams;
  const [showList, setShowList] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [list, setList] = useState<items[]>([]);
  const router = useRouter();
  const wrapperScroll = useRef(null);
  const { theme } = useTheme();
  const path = usePathname();

  const {
    services: { localisation },
  } = useAppContext();

  const selectedItems: items[] = useMemo(() => {
    if (
      !(props as any)[params] ||
      (props as any)[params]?.split(',')?.length === 0
    ) {
      return [];
    }

    return ((props as any)[params] as string).split(',').map((v) => {
      return {
        value: v,
        label: v.split(':')[1],
      };
    });
  }, [params, props]);

  const handleRemoveItems = useCallback(
    (value: string) => {
      const itemsList = selectedItems.filter((v) => v.value !== value);
      if (!itemsList.length) {
        delete (props as any)[params];
        router.push(createRouteWithQueries(path, props as any));
        return;
      }
      router.push(
        createRouteWithQueries(path, {
          ...props,
          [params]: itemsList.map((v) => v.value),
        }),
      );
    },
    [params, path, props, router, selectedItems],
  );

  const handleChooseZone = useCallback(
    (v: string) => {
      const prev = (props as any)[params]?.split(',') ?? [];

      if (prev?.includes(v)) {
        return;
      }
      if (prev.length >= limit) {
        router.push(
          createRouteWithQueries(path, {
            ...props,
            [params]: [
              ...prev
                .filter(
                  (v: string) => v.charAt(0) === label.charAt(0).toLowerCase(),
                )
                .slice(0, -1),
              v,
            ],
          }),
        );
        return;
      }
      router.push(
        createRouteWithQueries(path, {
          ...props,
          [params]: [
            ...prev.filter(
              (v: string) => v.charAt(0) === label.charAt(0).toLowerCase(),
            ),
            v,
          ],
        }),
      );
    },
    [label, limit, params, path, props, router],
  );

  const handleDeleteList = useCallback(() => {
    delete (props as any)[params];
    setValue('');
    router.push(createRouteWithQueries(path, props as any));
    return;
  }, [params, path, props, router]);

  const OutsideClick = useCallback(() => {
    setShowList(false);
    setValue('');
  }, []);

  const handleClickMenu = useCallback(() => {
    setShowList((prev) => !prev);
    if (showList) {
      setValue('');
    }
  }, [showList]);

  const handleDebounce = useCallback(
    async (v: string) => {
      if (!v) {
        return setList([]);
      }
      const value = Number.parseInt(v as string, 10);

      const { err, res } = await localisation({
        search: value ? value : v,
        zone: label,
      } as Zone);

      if (err) {
        return;
      }

      const result: any = Array.isArray(res) ? res : [res];
      if (result.filter((v: unknown) => v && v !== undefined).length === 0) {
        return setList([]);
      }

      setList(
        result.map((v: loc) => ({
          label: getLabel(v),
          value: `${label.charAt(0).toLowerCase()}${v.code}:${v.nom}`,
        })),
      );
    },
    [label, localisation],
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

  useDebouncer(handleDebounce, value, 250);

  const endContent = (): JSX.Element => {
    return (
      <div className="h-full w-fit -mr-1 flex justify-end space-x-2 items-center">
        <RxCrossCircled
          className={cn(
            'text-foreground/70 mr-1 hidden transition-transform duration-250 cursor-pointer hover:scale-110 hover:text-foreground',
            {
              block: value || selectedItems.length,
            },
          )}
          onClick={handleDeleteList}
        />
        <div className="h-11/12 w-0.5 text-transparent bg-asset/60">&nbsp;</div>
        <IoIosArrowDown
          onClick={handleClickMenu}
          className={cn(
            'text-foreground/70 md:w-4.5 lg:w-5 xl:w-6 transition-transform duration-250 cursor-pointer',
            { 'rotate-180': !showList },
          )}
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        'w-full md:py-[0.33rem] xl:py-[0.36rem] z-20 flex flex-col relative bg-content text-p3 rounded-lg shadow-border hover:border-gradient',
        classNames?.wrapper,
      )}
    >
      <OnOutsideClick onClickOutside={OutsideClick}>
        <div
          onFocus={() => setShowList(true)}
          onWheel={handleMouseScroll}
          className="relative flex items-center flex-row"
        >
          <span
            className={cn(
              'absolute inset-y-0 text-foreground/70 flex items-center ml-2 rounded-lg transition-all duration-150 py-0 md:px-0.5 lg:px-1',
              {
                '-translate-y-[70%] -translate-x-[10%] scale-80 h-fit bg-gradient-to-b from-background to-content':
                  showList || !!value || selectedItems?.length,
              },
              classNames?.label,
            )}
          >
            {label}
          </span>
          <ScrollShadow
            hideScrollBar
            ref={wrapperScroll}
            orientation="horizontal"
            size={30}
            className="w-full bg-transparent min-h-0 pr-0.5 py-0.5 flex items-center flex-row"
          >
            <div className="z-10 flex w-fit flex-row h-full items-center space-x-2.5 lg:px-1 xl:px-1.5">
              {selectedItems.map((v: items, i) => (
                <Chip
                  handleRemoveItems={() => handleRemoveItems(v.value)}
                  key={i}
                >
                  <p
                    className={cn('text-white/80 py-0.5 text-p3 inset-y-0', {
                      'text-white': theme === 'light',
                    })}
                  >
                    {v.label}
                  </p>
                </Chip>
              ))}
            </div>
            <Input
              type="text"
              value={value}
              placeholder={placeholder}
              onValueChange={(v: string) => setValue(v)}
              endContent={endContent()}
              classNames={{
                base: 'flex-1 -ml-2 z-10 bg-transparent outline-none z-10',
                innerWrapper: 'py-0 h-fit min-h-0',
                inputWrapper: '!bg-transparent min-h-0 py-0 h-fit',
                input:
                  'flex-1 min-w-[25%] py-[0.1rem] lg:py-[0.135rem] !text-p2 text-foreground/80 bg-transparent outline-none z-20',
              }}
              {...other}
            />
          </ScrollShadow>
        </div>
        <ScrollShadow
          className={cn(
            'w-full top-full !text-p3 text-foreground/80 flex flex-col absolute transition-all opacity-100 duration-250 rounded-b-md bg-content py-2 space-y-1 px-2.5 lg:max-h-32 xl:max-h-40 shadow-sm shadow-shadow',
            { 'h-0 opacity-0': !showList },
          )}
          size={5}
          hideScrollBar
          orientation="vertical"
        >
          {list?.length ? (
            list.map((v: items, i) => (
              <div
                key={i}
                onClick={() => handleChooseZone(v.value)}
                className="rounded-md w-full py-1 px-1.5 transition-transform duration-250 hover:font-medium text-foreground/90 cursor-pointer hover:bg-foreground/10 hover:text-foreground"
              >
                {v.label}
              </div>
            ))
          ) : (
            <span>{message}</span>
          )}
        </ScrollShadow>
      </OnOutsideClick>
    </div>
  );
};

export default Localisation;

function getLabel(v: loc): string {
  if (!v.region) {
    return `${v.nom}`;
  }
  return v.departement
    ? `${v.codesPostaux ? v.codesPostaux[0] : v.code} ${v.nom}${v.departement ? `, ${v.departement.nom}` : ''} ${v.region ? `- ${v.region.nom}` : ''}`
    : `${v.code} - ${v.nom}`;
}
