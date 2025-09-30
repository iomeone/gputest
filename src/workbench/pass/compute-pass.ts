import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ComputeToPass, CommandToBuffer, ComputeCounter } from './types';

import { yeet, memo } from '@use-gpu/live';
import { useDeviceContext } from '../providers/device-provider';
import { useInspectable } from '../hooks/useInspectable'
import { QueueReconciler } from '../reconcilers/index';

const {quote} = QueueReconciler;

export type ComputePassProps = PropsWithChildren<{
  calls: {
    pre?: CommandToBuffer[],
    compute?: ComputeToPass[],
  },
  immediate?: boolean,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<ComputePass>';
const LABEL = { label };

const computeToContext = (
  commandEncoder: GPUCommandEncoder,
  calls: ComputeToPass[],
  countDispatch: ComputeCounter,
) => {
  const passEncoder = commandEncoder.beginComputePass();
  for (const f of calls) f(passEncoder, countDispatch);
  passEncoder.end();
};

/** Compute pass.

Executes all compute calls. Can optionally run immediately instead of per-frame.
*/
export const ComputePass: LC<ComputePassProps> = memo((props: ComputePassProps) => {
  const {
    immediate,
    calls,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();

  const pres = toArray(calls['pre'] as CommandToBuffer[]);
  const computes = toArray(calls['compute'] as ComputeToPass[]);

  const run = () => {
    let ds = 0;
    let ss = 0;

    const countDispatch = (d: number, s: number) => { ds += d; ss += s; };

    const queue: GPUCommandBuffer[] = []
    for (const f of pres) {
      const q = f();
      if (q) queue.push(q);
    }

    if (computes.length) {
      const commandEncoder = device.createCommandEncoder(LABEL);
      computeToContext(commandEncoder, computes, countDispatch);

      const command = commandEncoder.finish();
      queue.push(command);
    }
    device.queue.submit(queue);

    inspect({
      render: {
        dispatches: ds,
        samples: ss,
      },
    });

    return null;
  };

  return immediate ? run() : quote(yeet(run));

}, 'ComputePass');
