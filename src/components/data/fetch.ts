import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { yeet, useAsync, useMemo, useOne } from '@use-gpu/live';

const SLOW = 1000;

type FetchAPIOptions = Parameters<typeof fetch>[1];

type FetchProps<T> = {
  url?: string,
  request?: Request,
  options?: FetchAPIOptions,
  version?: number,

  type?: 'buffer',
  loading?: T,
  fallback?: T,
  slow?: number,

  render?: (t: T) => LiveElement<any>,
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
    slow = SLOW,
  } = props;

  const run = useMemo(() => {
    const f = async () => {
      const response = await fetch(url ?? request, options);
      if (type === 'buffer') return response.arrayBuffer();
      return response;
    };
    
    return SLOW ? () => delay(f(), SLOW) : f;
  }, [url, request, JSON.stringify(options), type, version]);

  const [resolved, error] = useAsync(run, run);
  const result = resolved !== undefined ? resolved : (error !== undefined ? fallback : loading);

  return result !== undefined ? (render ? render(result) : yeet(result)) : null;
};

const delay = <T>(promise: Promise<T>, time: number = 0) =>
  promise.then((value: T) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(value), time)
    )
  )

