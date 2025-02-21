import { useCallback, useState } from 'react';

export type AsyncExecutorFunction<Args extends unknown[], Payload> = (...args: Args) => Promise<Payload>;

export type UseAsyncExecutorResult<Data, Args extends unknown[] = unknown[]> = {
  isLoading: boolean;
  error?: unknown | Error;
  status: AsyncExecutorStatus;
  asyncExecute: AsyncExecutorFunction<Args, Data>;
};

export type AsyncExecutorStatus = 'idle' | 'loading' | 'success' | 'error';

export const useAsyncExecutor = <Data, Args extends unknown[] = unknown[]>(
  asyncFn: AsyncExecutorFunction<Args, Data>,
  options?: {
    onSuccess?: (data: Data) => void | Promise<void>;
    onError?: (error: unknown | Error) => void;
    onFinally?: () => void;
  },
): UseAsyncExecutorResult<Data, Args> => {
  const [status, setStatus] = useState<AsyncExecutorStatus>('idle');
  const [error, setError] = useState<unknown | Error>();
  const isLoading = status === 'loading';

  const asyncExecute: AsyncExecutorFunction<Args, Data> = useCallback(
    async (...args: Args) => {
      setStatus('loading');
      try {
        const data = await asyncFn(...args);
        const successCallbackResult = options?.onSuccess?.(data);
        if (successCallbackResult instanceof Promise) {
          await successCallbackResult;
        }
        setStatus('success');
        return data;
      } catch (error) {
        setError(error);
        options?.onError?.(error);
        setStatus('error');
        throw error;
      } finally {
        options?.onFinally?.();
      }
    },
    [asyncFn],
  );

  return { isLoading, error, status, asyncExecute };
};
