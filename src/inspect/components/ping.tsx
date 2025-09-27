import type { LiveFiber, ArrowFunction } from '@use-gpu/live';
import { formatNodeName, incrementVersion } from '@use-gpu/live';

import React, { memo, createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

const PingContext = createContext<PingContextProps>({
  subscribe: () => {},
  unsubscribe: () => {},
});

const NO_DEPS: any[] = [];

type PingContextProps = {
  subscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => void,
  unsubscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => void,
};

type PingProviderProps = {
  fiber: LiveFiber<any>,
  children?: React.ReactElement<any>,
};

type Timer = ReturnType<typeof setTimeout>;

type PingEntry = [number, number, boolean];

// Track update pings to show highlights in tree
export const PingProvider: React.FC<PingProviderProps> = ({fiber, children}) => {
   const [map, all, api] = useMemo(() => {
    const map = new Map<number, Set<ArrowFunction>>();
    const all = new Set<ArrowFunction>();

    const api = {
      subscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => {
        if (!fiber) return all.add(f);

        let s = map.get(fiber.id);
        if (!s) {
          map.set(fiber.id, s = new Set<ArrowFunction>());
        }
        s.add(f);
      },
      unsubscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => {
        if (!fiber) return all.delete(f);

        let s = map.get(fiber.id);
        if (s) {
          s.delete(f);
          if (s.size === 0) map.delete(fiber.id);
        }
      },
      map,
    };
    return [map, all, api];
  }, NO_DEPS);

  useLayoutEffect(() => {
    let timer: Timer | null = null;
    let reset: Timer | null = null;

    let queue: PingEntry[] = [];
    let hot: PingEntry[] = [];
    let version = 0;

    let timeout = () => {
      reset = null;
      flush();
    };

    let flush = () => {
      timer = null;

      const q = queue.slice();
      queue.length = 0;
      
      const seen = new Set<number>();
      const mounts = new Set<number>();

      ReactDOM.unstable_batchedUpdates(() => {
        for (const [id, v, active] of q) {
          seen.add(id);

          const s = map.get(id)!;
          if (!s) {
            mounts.add(id);
            continue;
          }

          const fs = s.values();
          for (const f of fs) f(v, active);
        }
        for (const [id, v] of hot) if (!seen.has(id)) {
          const s = map.get(id)!;
          if (!s) {
            mounts.add(id);
            continue;
          }

          const fs = s.values();
          for (const f of fs) f(v, false);
        }
      
        for (const f of all) f(version, false);
      });

      setTimeout(() => {
        for (const id of mounts) {
          const s = map.get(id)!;
          if (!s) continue;

          const fs = s.values();
          for (const f of fs) f(0, true);
        }
      }, 0);

      hot = q;
    };

    if (!fiber.host) return;

    fiber.host.__ping = (fiber: LiveFiber<any>, active?: boolean) => {
      version = incrementVersion(version);
      queue.push([fiber.id, fiber.runs, !!active]);

      if (!timer) {
        timer = setTimeout(flush, 0);

        if (reset) clearTimeout(reset);
        reset = setTimeout(timeout, 100);
      }
    };
    return () => {
      if (fiber.host) fiber.host.__ping = () => {};
      if (timer) clearTimeout(timer);
    };
  }, NO_DEPS);

   return (
    <PingContext.Provider value={api}>
      {children}
    </PingContext.Provider>
  );
}

export const usePingContext = (fiber?: LiveFiber<any>) => {
  const {subscribe, unsubscribe} = useContext(PingContext);

  const [, forceUpdate] = useForceUpdate();
  const [version, setVersion] = useState<number>(-1);
  const [live, setLive] = useState<boolean>(false);

  useLayoutEffect(() => {
    const ping = (version: number, live: boolean) => {      
      if (live) setVersion(version);
      setLive(live);
      forceUpdate();
    };

    subscribe(fiber, ping);
    return () => unsubscribe(fiber, ping);
  }, [fiber]);

  return [version, live];
}

export const useForceUpdate = (): [number, () => void] => {
  const [version, setVersion] = useState<number>(0);
  const forceUpdate = useCallback(() => setVersion(incrementVersion), NO_DEPS);
  return [version, forceUpdate];
};
