import type { StorageSource, LambdaSource, TextureSource, UniformAttributeValue, TypedArray } from '../../core';
import type { ShaderModule } from '../../shader';

import { useOne, useVersion } from '../../live';
import { useTransformContext } from '../providers/transform-provider';
import { sourceToModule, bindingToModule, castTo, chainTo } from '../../shader/wgsl';
import { makeShaderBinding, makeShaderBindings } from '../../core';

const TRANSFORM_BINDING = { name: 'getPosition', format: 'vec4<f32>', value: [0, 0, 0, 0], args: ['u32'] } as UniformAttributeValue;

export const useApplyTransform = (
  positions?: StorageSource | LambdaSource | TextureSource | ShaderModule | TypedArray | number[] | {current: any},
) => {
  const transform = useTransformContext();
  const version = useVersion(positions) + useVersion(transform);

  const bound = useOne(() => {
    if (transform == null) return positions;
    let getPosition = sourceToModule(positions) ?? bindingToModule(makeShaderBinding(TRANSFORM_BINDING, positions));
    return chainTo(getPosition, transform);
  }, version);

  return bound;
};

