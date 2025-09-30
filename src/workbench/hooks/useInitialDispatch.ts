import { useCallback, useMemo, useRef, useNoCallback, useNoMemo, useNoRef } from '@use-gpu/live';
import { useRenderContext, useNoRenderContext } from '../providers/render-provider';

export const useInitialDispatch = (
  deps: any[],
) => {

  const firstRef = useRef(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { firstRef.current = true; }, deps);

  const shouldDispatch = useCallback(() => {
    if (!firstRef.current) return false;
    firstRef.current = false;
  }, []);

  return shouldDispatch;
};

export const useNoInitialDispatch = () => {
  useNoRef();
  useNoMemo();
  useNoCallback();
};

export const useInitialRender = (
  deps: any[],
) => {
  const renderContext = useRenderContext();
  return useInitialDispatch([renderContext, ...deps]);
};

export const useNoInitialRender = () => {
  useNoRenderContext();
  useNoInitialDispatch();
};
