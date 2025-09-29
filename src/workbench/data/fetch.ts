import type { LiveComponent, LiveElement } from '@use-gpu/live';
import { yeet, suspend, useAwait, useMemo, useOne } from '@use-gpu/live';
import { useSuspenseContext } from '../providers/suspense-provider';

const SLOW = 0;

export type FetchAPIOptions = Parameters<typeof fetch>[1];

export type FetchProps<T> = {
  url?: string,
  request?: Request,
  options?: FetchAPIOptions,
  version?: number,

  type?: keyof Response,
  loading?: T,
  fallback?: T,
  slow?: number,

  render?: (t: T) => LiveElement,
  then?: (t: T) => any,
};

export const Fetch: LiveComponent<FetchProps<any>> = (props: FetchProps<any>) => {
  const {
    url,
    request,
    options,
    version,
    type,
    loading,
    fallback,
    render,
    then,
    slow = SLOW,
  } = props;

  const suspense = useSuspenseContext();

  const run = useMemo(() => {
    const f = async () => {
      const response = await fetch((url ?? request)!, options);
      if (type != null && typeof response[type] === 'function') return (response[type] as any)();
      return response;
    };

    let go = (url ?? request) ? (slow ? () => delay(f(), slow) : f) : async () => null;
    return then ? async () => go().then(then) : go;
  }, [url, request, JSON.stringify(options), type, version]);

  const [resolved, error] = useAwait(run, [run]);
  const result = resolved !== undefined ? resolved : (error !== undefined ? fallback : loading);
  
  return result !== undefined ? (render ? render(result) : yeet(result)) : (suspense ? suspend() : null);
};

Fetch.displayName = 'Fetch';

const delay = <T>(promise: Promise<T>, time: number = 0) =>
  promise.then((value: T) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(value), time)
    )
  )

