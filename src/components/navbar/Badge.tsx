'use client';
import useSocketContext from '@/hooks/providers/socketProvider';
import { eventStore } from '@/interfaces/events';
import { localStorageManager } from '@/libs/storage';
import { publicPaths } from '@/middlewares/autorisation';
import cn from '@/utils/cn';
import { Badge } from '@nextui-org/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiOutlineBell } from 'react-icons/ai';

const BadgeNotification = () => {
  const [events, setEvents] = useState<eventStore[]>(() => {
    if (localStorageManager.haveAccess) {
      const storedEvents =
        localStorageManager.getItem<eventStore[]>('bill_event');
      return Array.isArray(storedEvents) ? storedEvents : [];
    }
    return [];
  });

  const [hasNew, setHasNew] = useState<boolean>(false);
  const pathName = usePathname();
  const inLoggingPage = useMemo(
    () => publicPaths.includes(`/${pathName.split('/')[1]}`),
    [pathName],
  );
  const { socketListener } = useSocketContext();

  useEffect(() => {
    if (socketListener?.length) {
      const event = socketListener
        .filter((evt) => evt.name === 'bill_event')
        ?.map((v) => v.value as eventStore);
      localStorageManager.addItem('bill_event', event);
      setEvents((prev) => {
        const newEvents = prev?.concat(event);
        return newEvents;
      });
      if (event.length > 0) {
        return setHasNew(true);
      }
    }
  }, [socketListener]);

  const handleActive = useCallback(
    (open: boolean) => {
      setHasNew(false);
      if (!open) {
        const editEvt = events.map((e) => ({ ...e, sawIt: true }));
        localStorageManager.setItem('bill_event', editEvt);
        setEvents(editEvt);
      }
    },
    [events],
  );

  return (
    <>
      {inLoggingPage ? (
        <div className="hover:cursor-not-allowed opacity-50 relative w-full h-full">
          <Badge
            content=""
            isInvisible={!hasNew}
            isOneChar
            size="sm"
            shape="circle"
            classNames={{
              base: 'w-full h-full',
              badge:
                'bg-gradient-to-tr from-secondary to-special border-1 border-border',
            }}
          >
            <AiOutlineBell className="w-full h-full md:scale-110 lg:scale-100 xl:scale-95" />
          </Badge>
        </div>
      ) : (
        <Popover
          onOpenChange={(open) => handleActive(open)}
          classNames={{ content: 'p-0' }}
          placement="bottom"
        >
          <PopoverTrigger className="p-0">
            <div className="relative w-full h-full">
              <Badge
                content=""
                isInvisible={!hasNew}
                isOneChar
                size="sm"
                shape="circle"
                classNames={{
                  base: 'w-full h-full',
                  badge:
                    'bg-gradient-to-tr from-secondary to-special border-1 border-border',
                }}
              >
                <AiOutlineBell className="w-full h-full md:scale-110 lg:scale-100 xl:scale-95" />
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="absolute md:w-72 md:-translate-y-0.5 lg:translate-y-0 lg:translate-x-6 xl:translate-x-10 lg:w-72 xl:w-[21rem] border-shadow border-1 top-full bg-asset rounded-lg">
              {!events?.length ? (
                <div className="w-full h-full text-p4 relative bg-content/90 rounded-lg lg:p-3 xl:p-4">
                  <span>
                    Aucune notification actuellement, Vos futures notifications
                    s&#39;afficheront ici.
                  </span>
                </div>
              ) : (
                <ScrollShadow
                  size={1}
                  hideScrollBar
                  orientation="vertical"
                  className="w-full h-full relative lg:max-h-64 xl:max-h-72 bg-content/90 rounded-lg lg:p-3 xl:p-4 space-y-5"
                >
                  {events?.map((e, i) => (
                    <div
                      key={i}
                      className={cn('w-full flex flex-col', {
                        'border-b-1 border-asset/75 pb-2':
                          i < events.length - 1,
                      })}
                    >
                      <span className="text-foreground/80 relative text-p4 font-medium block">
                        {!e.sawIt && (
                          <div className="absolute lg:-top-2.5 lg:-right-4 xl:-top-2 xl:-right-3 -translate-x-1/2 h-3 w-3 rounded-full bg-gradient-to-tr from-secondary to-special border-1 border-border"></div>
                        )}
                        {e.text}
                        <div className="float-right text-i1 relative mt-0.5 ml-10">
                          <span>{e.date}</span>
                        </div>
                      </span>
                    </div>
                  ))}
                </ScrollShadow>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default BadgeNotification;
