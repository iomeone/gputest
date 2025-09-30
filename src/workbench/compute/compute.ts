import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { AggregatedCalls } from '../pass/types';

import { use, memo, multiGather, useOne } from '@use-gpu/live';

import { ComputePass } from '../pass/compute-pass';
import { ReadbackPass } from '../pass/readback-pass';

export type ComputeProps = PropsWithChildren<{
  immediate?: boolean,
}>;

export const Compute: LC<ComputeProps> = memo((props: ComputeProps) => {
  const {
    immediate,
    children,
  } = props;

  const Resume = (calls: AggregatedCalls) =>
    useOne(() => [
      calls.pre || calls.compute ? use(ComputePass, {immediate, calls}) : null,
      calls.post || calls.readback ? use(ReadbackPass, {calls}) : null,
    ], calls);

  return (
    multiGather(children, Resume)
  );

  return multiGather(children, Resume);
}, 'Compute');
