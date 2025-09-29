import type { LC, PropsWithChildren, LiveFiber, LiveElement, ArrowFunction } from '@use-gpu/live';
import type { ComputeToPass, ComputeCounter } from './types';

import { quote, yeet, memo } from '@use-gpu/live';
import { useDeviceContext } from '../providers/device-provider';
import { useInspectable } from '../hooks/useInspectable'

export type ComputePassProps = {
  calls: {
    compute?: ComputeToPass[],
  },
  immediate?: boolean,
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 

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
export const ComputePass: LC<ComputePassProps> = memo((props: PropsWithChildren<ComputePassProps>) => {
  const {
    immediate,
    calls,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();

  const computes = toArray(calls['compute'] as ComputeToPass[]);

  const run = () => {
    let ds = 0;
    
    const countDispatch = (d: number) => { ds += d; };

    if (computes.length) {
      const commandEncoder = device.createCommandEncoder();
      computeToContext(commandEncoder, computes, countDispatch);

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    inspect({
      render: {
        dispatchCount: ds,
      },
    });

    return null;
  };

  return immediate ? run() : quote(yeet(run));

}, 'ComputePass');
