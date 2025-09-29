import type { LC, PropsWithChildren, ArrowFunction } from '@use-gpu/live';
import type { AggregatedCalls } from '../pass/types';

import { use, memo, multiGather, useOne } from '@use-gpu/live';
import { useInspectable } from '../hooks/useInspectable'

import { ComputePass } from '../pass/compute-pass';
import { ReadbackPass } from '../pass/readback-pass';

export type ComputeProps = {
  immediate?: boolean,
};

export const Compute: LC<ComputeProps> = memo((props: PropsWithChildren<ComputeProps>) => {
  const {
    immediate,
    children,
  } = props;

  const inspect = useInspectable();

  const Resume = (calls: AggregatedCalls) =>
    useOne(() => [
      calls.compute ? use(ComputePass, {immediate, calls}) : null,
      calls.post || calls.readback ? use(ReadbackPass, {calls}) : null,
    ], calls);

  return multiGather(children, Resume);
}, 'Pass');
