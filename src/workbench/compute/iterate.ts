import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Lazy } from '@use-gpu/core';

import { multiGather, yeet, useMemo } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';

export type IterateProps = {
  count: Lazy<number>,
};

/** Iteration combinator for multi-gathered lambdas */
export const Iterate: LiveComponent<IterateProps> = (props: PropsWithChildren<IterateProps>) => {
  const {
    count,
    children,
  } = props;

  return multiGather(children, (values: Record<string, any[]>) => {
    const c = resolve(count);
    return useMemo(() => {
      if (!values.compute) return yeet(values);

      const compute = values.compute.map(f => (...args: any[]) => {
        for (let i = 0; i < c; ++i) f(...args);
      });
      return yeet({...values, compute});
    }, [c, values]);
  });
};
