import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import { yeet, fence, provide, makeContext, useContext, useNoContext, useOne, useRef, SUSPEND } from '@use-gpu/live';

type SuspenseContextProps = boolean;

export const SuspenseContext = makeContext<SuspenseContextProps>(false, 'SuspenseContext');

export const useSuspenseContext = () => useContext(SuspenseContext);
export const useNoSuspenseContext = () => useNoContext(SuspenseContext);

type SuspenseProps = {
  fallback?: LiveElement,
};

export const Suspense: LiveComponent<SuspenseProps> = (props: PropsWithChildren<SuspenseProps>) => {
  const {fallback} = props;

  const lastValue = useRef<any>();
  const view = provide(SuspenseContext, true, props.children);

  if (fallback) {
    return fence(view, (value: any) => {
      if (value === SUSPEND) {
        if (lastValue.current === undefined) return fallback;
      }
      return useOne(() => yeet(lastValue.current = value), value);
    }, fallback);
  }
  return view;
}
