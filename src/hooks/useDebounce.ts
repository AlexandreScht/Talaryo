import { useEffect, useRef } from 'react';

export default function useDebouncer<T>(
  callback: (v: T) => unknown,
  dependency: T,
  delay?: number,
) {
  const timerRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const timer = setTimeout(() => {
      callback(dependency);
    }, delay ?? 250);

    timerRef.current = timer;

    return () => clearTimeout(timerRef.current);
  }, [dependency, delay, callback]);
}
