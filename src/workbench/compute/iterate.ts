import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Lazy } from '@use-gpu/core';

import { multiGather, yeet, useMemo } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';

export type IterateProps = PropsWithChildren<{
  count: Lazy<number>,
}>;

/** Iteration combinator for multi-gathered compute lambdas */
export const Iterate: LiveComponent<IterateProps> = (props: IterateProps) => {
  const {
    count,
    children,
  } = props;

  return multiGather(children, (values: Record<string, any[]>) => {
    const c = resolve(count);
    return useMemo(() => {
      if (!values.compute) return yeet(values);

      const compute = (...args: any[]) => {
        for (let i = 0; i < c; ++i) {
          for (const f of values.compute) {
            f(...args);
          }
        }
      };

      return yeet({...values, compute});
    }, [c, values]);
  });
};
