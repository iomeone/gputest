import { UniformAttributeValue } from '../../core/types';
import { ShaderSource } from '../../shader/wgsl/types';

import { useOne, useMemo, useVersion } from '../../live';
import { makeShaderBinding } from '../../core';
import { bindingToModule } from '../../shader/wgsl';

type Ref<T> = { current: T };

const NO_SOURCES: any[] = [];

// Turn a shader source/constant/lambda into a virtual shader module
export const useBoundSource = (
  def: UniformAttributeValue,
  source: ShaderSource,
) => {
  return useMemo(() => {
    // ParsedBundle | ParsedModule
    if (source.module || source.table) return source;

    // LambdaSource
    if (source.shader) return source.shader;

    const binding = makeShaderBinding<ShaderModule>(def, source);
    return bindingToModule(binding);
  }, [source, def]);
}
