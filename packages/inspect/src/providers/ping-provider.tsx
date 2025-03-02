import type { LiveFiber, ArrowFunction } from '@use-gpu/live';
import { incrementVersion } from '@use-gpu/live';

import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

const PingContext = createContext<PingContextProps>({
  subscribe: () => {},
  unsubscribe: () => {},
  fibers: new Map(),
});

const NO_DEPS: any[] = [];

type PingContextProps = {
  subscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => void,
  unsubscribe: (fiber: LiveFiber<any> | null | undefined, f: ArrowFunction) => void,
  fibers: Map<number, LiveFiber<any>>,
};

type PingProviderProps = {
  fiber: LiveFiber<any>,
  children?: React.ReactNode,
};

type Timer = ReturnType<typeof setTimeout>;

type PingEntry = [number, number, boolean];

// Track update pings to show highlights in tree
export const PingProvider: React.FC<PingProviderProps> = ({fiber, children}) => {
  const [fibers, map, all, api] = useMemo(() => {
    const fibers = new Map<number, LiveFiber<any>>();
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

        const s = map.get(fiber.id);
        if (s) {
          s.delete(f);
          if (s.size === 0) map.delete(fiber.id);
        }
      },
      map,
      fibers,
    };
    return [fibers, map, all, api];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NO_DEPS);

  useLayoutEffect(() => {
    let timer: Timer | null = null;
    let reset: Timer | null = null;

    //
    const queue: PingEntry[] = [];
    let hot: PingEntry[] = [];
    let version = 0;

    const timeout = () => {
      reset = null;
      flush();
    };

    const flush = () => {
      timer = null;

      const q = queue.slice();
      queue.length = 0;

      const seen = new Set<number>();

      ReactDOM.unstable_batchedUpdates(() => {
        // Ping each queued fiber's listeners
        for (const [id, v, active] of q) {
          seen.add(id);

          const s = map.get(id);
          if (!s) continue;

          const fs = s.values();
          for (const f of fs) f(v, active);
        }
        // Unping last fiber's listeners
        for (const [id, v] of hot) if (!seen.has(id)) {
          const s = map.get(id);
          if (!s) continue;

          const fs = s.values();
          for (const f of fs) f(v, false);
        }
        // Ping global listeners
        for (const f of all) f(version, false);
      });

      hot = q;
    };

    if (!fiber.host) return;

    fiber.host.__ping = (fiber: LiveFiber<any>, active?: boolean) => {
      version = incrementVersion(version);
      queue.push([fiber.id, fiber.runs, !!active]);

      if (!timer) {
        // Schedule immediate 'on' flush
        timer = setTimeout(flush, 0);

        // Schedule 'off' flush in 200ms if idle
        if (reset) clearTimeout(reset);
        reset = setTimeout(() => setTimeout(timeout, 16), 200);
      }

      if (fiber.bound) { if (!fibers.get(fiber.id)) fibers.set(fiber.id, fiber); }
      else { fibers.delete(fiber.id); }
    };
    return () => {
      if (fiber.host) fiber.host.__ping = () => {};
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NO_DEPS);

   return (
    <PingContext.Provider value={api}>
      {children}
    </PingContext.Provider>
  );
}

export const usePingContext = () => useContext(PingContext);

export const usePingTracker = (fiber?: LiveFiber<any>) => {
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
  }, [fiber, forceUpdate, subscribe, unsubscribe]);

  return [version, live];
}

export const useForceUpdate = (): [number, () => void] => {
  const [version, setVersion] = useState<number>(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const forceUpdate = useCallback(() => setVersion(incrementVersion), NO_DEPS);
  return [version, forceUpdate];
};
