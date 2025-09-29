import type { UniformAttribute, UniformAttributeValue } from '../../core';
import type { ShaderSource, ShaderModule } from '../../shader';

import { useOne, useMemo, useNoMemo, useVersion } from '../../live';
import { makeShaderBinding } from '../../core';
import { bindingToModule } from '../../shader/wgsl';

type Ref<T> = { current: T };

const NO_SOURCES: any[] = [];

// Turn a shader source/constant/lambda into a virtual shader module
export const useBoundSource = <T = any>(
  def: UniformAttribute | UniformAttributeValue,
  source: ShaderSource | T,
) => {
  return useMemo(() => getBoundSource(def, source), [def, source]);
}

// Turn a shader source/constant/lambda into a virtual shader module
export const getBoundSource = <T = any>(
  def: UniformAttribute | UniformAttributeValue,
  source: ShaderSource | T,
) => {
  const s = source as any;

  // ParsedBundle | ParsedModule
  if (s.module || s.table) return s;

  // LambdaSource
  if (s.shader) return s.shader;

  const binding = makeShaderBinding<ShaderModule>(def, s);
  return bindingToModule(binding);
}

export const useNoBoundSource = useNoMemo;

