import type { LC, PropsWithChildren, LiveFiber, LiveElement, ArrowFunction } from '@use-gpu/live';

import { use, quote, yeet, memo, useContext, useMemo } from '@use-gpu/live';
import { useInspectable } from '../hooks/useInspectable'

export type DispatchPassProps = {
  calls: {
    dispatch?: ArrowFunction[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 

/** Dispatch pass.

Executes all dispatch calls.
*/
export const DispatchPass: LC<DispatchPassProps> = memo((props: PropsWithChildren<DispatchPassProps>) => {
  const {
    calls,
  } = props;

  const inspect = useInspectable();

  const dispatches = toArray(calls['dispatch'] as ArrowFunction[]);

  const run = () => {
    let ds = 0;
    
    const countDispatch = (d: number) => { ds += d; };

    if (dispatches.length) {
      for (const f of dispatches) f();
    }

    inspect({
      render: {
        dispatchCount: ds,
      },
    });

    return null;
  };

  return quote(yeet(run));

}, 'DispatchPass');
