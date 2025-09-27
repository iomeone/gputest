import { StorageSource, LambdaSource } from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/wgsl/types';

import { useOne, useVersion } from '@use-gpu/live';
import { useTransformContext } from '../providers/transform-provider';
import { sourceToModule, bindingToModule, chainTo } from '@use-gpu/shader/wgsl';
import { makeShaderBinding, makeShaderBindings } from '@use-gpu/core';

const TRANSFORM_BINDING = { name: 'getPosition', format: 'vec4<f32>', value: [0, 0, 0, 0], args: ['u32'] } as UniformAttributeValue;

export const useApplyTransform = (
  positions: StorageSource | LambdaSource | ShaderModule,
) => {
  const transform = useTransformContext();
  const version = useVersion(positions) + useVersion(transform);

  const bound = useOne(() => {
    if (!transform) return positions;

    const getPosition = sourceToModule(positions) ?? bindingToModule(makeShaderBinding(TRANSFORM_BINDING, positions));
    return chainTo(getPosition, transform);
  }, version);

  return bound;
};

