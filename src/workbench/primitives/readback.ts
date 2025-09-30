import type { LC, LiveElement } from '../../live';
import type { StorageSource, TypedArray } from '../../core';

import { memo, yeet, useRef, useResource } from '../../live';

import { useReadbackStorage } from '../hooks/useReadbackStorage';

export type ReadbackProps = {
  source: StorageSource,
  then?: (data: TypedArray) => LiveElement,

  shouldDispatch?: () => boolean | number | undefined,
  onDispatch?: () => void,
};

export const Readback: LC<ReadbackProps> = memo((props: ReadbackProps) => {
  const {
    source,
    then,
    shouldDispatch,
    onDispatch,
  } = props;

  let dispatchVersion: number | null = null;
  let dispatched = false;

  let cancelled = false;
  useResource((dispose) => dispose(() => cancelled = true));

  const lastRender = useRef<LiveElement>(null);
  const {dispatchCopy, asyncRead} = useReadbackStorage(source);

  return yeet({
    post: () => {
      if (cancelled) return null;
      dispatched = false;

      if (shouldDispatch) {
        const d = shouldDispatch();
        if (d === false) return;
        if (typeof d === 'number') {
          if (dispatchVersion === d) return;
          dispatchVersion = d;
        }
      }
      onDispatch?.();
      dispatched = true;

      return dispatchCopy();
    },
    readback: async () => {
      if (cancelled) return null;
      if (!dispatched) return lastRender.current;

      const data = await asyncRead();
      return data ? (then ? (lastRender.current = then(data)) : null) : lastRender.current;
    },
  });
}, 'Readback');
