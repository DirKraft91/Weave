import { useCallback, useRef } from 'react';

type DebouncedFunction<T extends string | number | object> = (value: T) => void;

export function useDebounce<T extends string | number | object>(
  callback: DebouncedFunction<T>,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay]
  );
}
