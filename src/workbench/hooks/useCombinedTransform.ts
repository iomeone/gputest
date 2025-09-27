import type { ArrowFunction } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';

import { useOne, useVersion } from '@use-gpu/live';
import { useTransformContext } from '../providers/transform-provider';
import { chainTo } from '@use-gpu/shader/wgsl';
import { vec4 } from 'gl-matrix';

export const useCombinedTransform = (
  shader?: ShaderModule | null,
) => {
  const context = useTransformContext();
  const version = useVersion(context) + useVersion(shader);

  return useOne(
    () => {
      return context && shader
        ? chainTo(shader, context)
        : context ?? shader;
    },
    version,
  );
};
