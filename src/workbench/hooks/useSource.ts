import type { UniformAttribute } from '../../core';
import type { ShaderSource, ShaderModule } from '../../shader';

import { useMemo, useNoMemo } from '../../live';
import { makeShaderBinding } from '../../core';
import { bindingToModule, bundleToAttribute } from '../../shader/wgsl';

// Turn a shader source/constant/lambda into a virtual shader module
export const useSource = <T = any>(
  def: UniformAttribute,
  source: ShaderSource | T,
) => {
  return useMemo(() => getSource(def, source), [def, source]);
}

// Turn a shader source/constant/lambda into a virtual shader module
export const getSource = <T = any>(
  def: UniformAttribute,
  source: ShaderSource | T,
) => {
  const s = source as any;
  let shader;

  if (s == null) return null;

  // ParsedBundle | ParsedModule
  if (s.module || s.table) shader = s as ShaderModule;

  // LambdaSource
  if (s.shader) shader = s.shader;

  // If shader return type matches, bind directly, otherwise make a binding with a cast
  if (shader) {
    const {format} = bundleToAttribute(shader);
    if (format === def.format) return shader;
  }

  const binding = makeShaderBinding<ShaderModule>(def, s) as any;
  return bindingToModule(binding);
};

export const useNoSource = useNoMemo;

