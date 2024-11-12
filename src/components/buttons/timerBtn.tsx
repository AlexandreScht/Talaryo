'use client';
import Button from '@/components/buttons';
import useAppContext from '@/hooks/providers/AppProvider';
import cn from '@/utils/cn';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function TimerBtn({
  initialTimer = 0,
  setInitialTimer,
  loading,
  handleClick,
  className,
  text = 'Renvoyer le code',
}: {
  initialTimer: number;
  setInitialTimer: React.Dispatch<React.SetStateAction<number>>;
  text?: string;
  className?: string;
  handleClick: () => unknown;
  loading?: boolean;
}) {
  const { theme } = useTheme();
  const [timer, setTimer] = useState<number>(initialTimer);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const {
    stores: { setTimerUser, getTimerUser },
  } = useAppContext();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionTimer = getTimerUser('CodeTimer');
      if (sessionTimer && sessionTimer > 1) {
        setTimer(sessionTimer);
        return;
      }
      setTimer(initialTimer);
    }
  }, [getTimerUser, initialTimer, setTimer]);

  useEffect(() => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    if (timer === 0) {
      setInitialTimer(0);
      return;
    }
    timerIdRef.current = setTimeout(() => {
      setTimer((v) => v - 1);
      setTimerUser({
        storageName: 'CodeTimer',
        values: timer,
      });
    }, 1000);
    return () => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, [setInitialTimer, setTimerUser, timer]);

  const timerStr = useMemo(() => {
    if (timer === 0) return;
    const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timer]);

  return (
    <Button
      endContent={
        timerStr ? <span className="ml-auto">{timerStr}</span> : <></>
      }
      className={cn(
        '!text-p1 text-foreground bg-primary/30 relative w-full min-h-0 h-fit py-2.5 rounded-lg border-1 border-special/70',
        { 'bg-secondary/20 border-1 border-special/50': theme === 'dark' },
        className,
      )}
      type="button"
      isDisabled={timer > 0 || loading}
      isLoading={loading}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
}
