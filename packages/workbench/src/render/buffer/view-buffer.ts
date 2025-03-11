import type { LC } from '@use-gpu/live';
import type { PassBinding } from '../../pass/types';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useUniformBinding } from '../../hooks/useUniformSource';
import { useScratchSource, useNoScratchSource } from '../../hooks/useScratchSource';
import { useViewContext, useNoViewContext } from '../../providers/view-provider';

export const ViewBuffer: LC = memo(() =>
  yeet(useViewBuffer()),
'ViewBuffer');

export const useViewBuffer = () => {
  const {binding, cull, uniforms} = useViewContext();
  const viewBinding = useViewBufferBinding(binding);
  
  return {
    bindings: {view: viewBinding},
    views: {view: {cull, uniforms}},
  };
};

export const useNoViewBuffer = () => {
  useNoViewContext();
  useNoViewBinding();
};

const useViewBufferBinding = (viewBinding: PassBinding) => {
  if (viewBinding.bind) return (useNoScratchSource(), viewBinding);

  // If no view provider mounted, provide an empty buffer
  const viewSource = useScratchSource('f32', {flags: GPUBufferUsage.UNIFORM, reserve: 256})[0];
  return {...viewBinding, bind: () => [viewSource]};
};

const useNoViewBinding = useNoScratchSource;
