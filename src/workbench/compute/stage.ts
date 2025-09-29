import type { LC, PropsWithChildren, LiveFiber, LiveElement, Task } from '@use-gpu/live';
import type { StorageTarget, TextureTarget } from '@use-gpu/core';

import { memo, provide, useMemo } from '@use-gpu/live';
import { ComputeContext } from '../providers/compute-provider';

const NO_TARGETS: any[] = [];

export type StageProps = {
  target?: StorageTarget | TextureTarget,
  targets?: (StorageTarget | TextureTarget)[],
  live?: boolean,
  render?: () => LiveElement,
};

/** Set the target (`@{ComputeContext}) for compute kernels (`@{<Kernel>}`) inside. */
export const Stage: LC<StageProps> = memo((props: PropsWithChildren<StageProps>) => {
  const {
    live = false,
    target,
    targets,
    children,
    render,
  } = props;

  const content = render ? render() : children;
  if (!content) return null;
  
  const context = useMemo(() => targets ?? (target ? [target] : NO_TARGETS), [target, ...(targets ?? NO_TARGETS)]);

  return provide(ComputeContext, context, content);
}, 'Stage');
