'use client';
import type {
  KeyDown,
  SelectDown,
  SelectDownItems,
} from '@/interfaces/components';
import { role } from '@/interfaces/users';
import { roleAccess } from '@/middlewares/autorisation';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import type { Selection } from '@nextui-org/react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Chip from '../card/chip';

const SelectMenu = ({
  label,
  items,
  multiple,
  className,
  searchParams,
  User,
}: SelectDown) => {
  // const SelectMenu = ({ label, maxItems, items, multiple, className, routeDir, searchParams, User }: SelectDown) => {
  const { theme } = useTheme();
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(searchParams?.platform ? ['', searchParams?.platform] : ['']),
  );
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (searchParams?.platform) {
      setSelectedKeys(
        new Set(searchParams?.platform ? ['', searchParams?.platform] : ['']),
      );
    }
  }, [router, searchParams]);

  const selectedItems = useMemo(
    () =>
      Array.from(selectedKeys)
        .join(', ')
        .replaceAll('_', ' ')
        .split(',')
        .filter((v) => v)
        .map((v) => v.trim()),
    [selectedKeys],
  );

  const handleSelect = useCallback((select: Selection) => {
    const SelectedChoices = Array.from(select)
      .join(', ')
      .replaceAll('_', ' ')
      .split(',')
      .filter((v) => v)
      .map((v) => v.trim());

    if (!SelectedChoices.length) {
      return setSelectedKeys(new Set(['']));
    }

    const [group, choice, value] = SelectedChoices.slice(-1)[0].split(
      ':',
    ) as KeyDown;

    switch (choice) {
      case 'multiple':
        setSelectedKeys(
          new Set([
            '',
            ...SelectedChoices.filter((item) => item.includes(`:${choice}:`)),
          ]),
        );
        break;
      case 'unique':
        setSelectedKeys(new Set(['', `${group}:${choice}:${value}`]));
        break;
      case 'group':
        setSelectedKeys(
          new Set([
            '',
            ...SelectedChoices.filter((item) =>
              item.includes(`${group}:${choice}:`),
            ),
          ]),
        );
        break;
      default:
        setSelectedKeys(new Set(['']));
        break;
    }
  }, []);

  const itemDisabled = useCallback(
    (props: boolean | role) => {
      if (typeof props === 'string') {
        return !roleAccess(props, User);
      }
      if (typeof props === 'boolean') {
        return props;
      }
      return false;
    },
    [User],
  );

  const handleClose = useCallback(() => {
    if (!selectedItems.length) {
      delete searchParams?.platform;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(createRouteWithQueries(path, searchParams as any));
      return;
    }
    router.push(
      createRouteWithQueries(path, {
        ...searchParams,
        platform: [...selectedItems],
      }),
    );
  }, [path, router, searchParams, selectedItems]);

  return (
    <>
      {/* {multiple && <span className="absolute -top-7 right-1 text-p4 text-asset/90">{maxItems - selectedItems.length} sélections restantes</span>} */}

      <Dropdown
        type="listbox"
        className="group bg-content shadow-sm shadow-shadow px-3"
        onClose={handleClose}
      >
        <DropdownTrigger>
          <div
            className={cn(
              'md:py-[0.3rem] xl:py-[0.36rem] w-full md:pl-0.5 lg:pl-1 md:pr-1 lg:pr-1.5 flex flex-wrap relative z-10 !rounded-lg bg-content text-base xl:text-lg cursor-pointer shadow-border hover:border-gradient',
              className,
            )}
          >
            {selectedItems?.length ? (
              selectedItems.map((value, index) => (
                <Chip
                  className="md:py-[0.13rem] xl:py-[0.17rem] md:px-1.5 mx-1 lg:px-2"
                  key={index}
                >
                  <span
                    className={cn('text-white/90 !text-p3 my-[0.12rem]', {
                      'text-white': theme === 'light',
                    })}
                  >
                    {value.split(':')[2]}
                  </span>
                </Chip>
              ))
            ) : (
              <span className="p-1 text-foreground/70 text-p3">{label}</span>
            )}
          </div>
        </DropdownTrigger>
        <DropdownMenu
          className="rowI"
          aria-label="Select your platform of search"
          variant="flat"
          closeOnSelect={false}
          disallowEmptySelection
          selectionMode={'multiple'}
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelect}
        >
          {items.map((item, index) => {
            const {
              type = 'multiple',
              disabled,
              title,
              itemsList,
              access,
            }: SelectDownItems = item;

            return (
              <DropdownSection
                key={index}
                title={title}
                classNames={{
                  group: 'pt-2 mt-1 border-t-1 border-border',
                  heading: 'text-secondary !text-p2 font-semibold mb-2',
                  base: cn({ 'ml-4': index > 0 }),
                }}
              >
                {itemsList.map((dataItem) => {
                  const { name } = dataItem;
                  const isItemDisabled =
                    disabled ||
                    itemDisabled(
                      dataItem.disabled || dataItem.access || access || false,
                    );

                  return (
                    <DropdownItem
                      key={`${item.id}:${multiple ? type : 'unique'}:${name}`}
                      data-hover="none"
                      data-focus="none"
                      isReadOnly={isItemDisabled}
                      classNames={{
                        base: cn({
                          'data-[hover=true]:bg-transparent cursor-not-allowed':
                            isItemDisabled,
                        }),
                        title: cn('text-p3 !text-foreground/80', {
                          '!text-asset/70': isItemDisabled,
                        }),
                      }}
                    >
                      {name}
                    </DropdownItem>
                  );
                })}
              </DropdownSection>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

export default SelectMenu;
