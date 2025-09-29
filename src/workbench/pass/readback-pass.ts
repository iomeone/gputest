import type { LC, PropsWithChildren, LiveFiber, LiveElement, ArrowFunction } from '@use-gpu/live';
import type { CommandToBuffer } from '../pass';

import { use, quote, yeet, memo, useMemo } from '@use-gpu/live';
import { useDeviceContext } from '../providers/device-provider';
import { Await } from '../queue/await';

export type ReadbackPassProps = {
  calls: {
    post?: CommandToBuffer[],
    readback?: ArrowFunction[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 

/** Readback pass.

Executes all post-compute calls and awaits promises for readback.
*/
export const ReadbackPass: LC<ReadbackPassProps> = memo((props: PropsWithChildren<ReadbackPassProps>) => {
  const {
    calls,
  } = props;

  const device = useDeviceContext();

  const post     = toArray(calls['post']     as CommandToBuffer[]);
  const readback = toArray(calls['readback'] as ArrowFunction[]);

  return quote(yeet(() => {

    const queue: GPUCommandBuffer[] = []
    for (const f of post) {
      const q = f();
      if (q) queue.push(q);
    }
    device.queue.submit(queue);

    let deferred: Promise<LiveElement>[] | null = null;
    for (const f of readback) {
      const d = f();
      if (d) {
        if (!deferred) deferred = [];
        deferred.push(d);
      }
    }

    return deferred ? use(Await, {all: deferred}) : null;
  }));
}, 'ReadbackPass');
