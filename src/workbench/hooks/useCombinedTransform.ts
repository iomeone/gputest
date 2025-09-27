import type { ArrowFunction } from '../../live';
import type { ShaderModule } from '../../shader';

import { useOne, useVersion } from '../../live';
import { useTransformContext } from '../providers/transform-provider';
import { chainTo } from '../../shader/wgsl';
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
