import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { StorageTarget, TextureTarget } from '@use-gpu/core';

import { memo, provide, useMemo } from '@use-gpu/live';
import { ComputeContext } from '../providers/compute-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

const NO_TARGETS: any[] = [];

export type StageProps = PropsWithChildren<{
  target?: StorageTarget | TextureTarget,
  targets?: (StorageTarget | TextureTarget)[],
  render?: () => LiveElement,
  children?: LiveElement | (() => LiveElement);
}>;

/** Set the target (`@{ComputeContext}) for compute kernels (`@{<Kernel>}`) inside. */
export const Stage: LC<StageProps> = memo((props: StageProps) => {
  const {
    target,
    targets,
    children,
  } = props;

  const render = getRenderFunc(props);
  const content = render ? render() : children;
  if (!content) return null;

  const context = useMemo(() => targets ?? (target ? [target] : NO_TARGETS), [target, ...(targets ?? NO_TARGETS)]);

  return provide(ComputeContext, context, content);
}, 'Stage');
