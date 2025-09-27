import type { UniformAttribute, UniformAttributeValue } from '../../core';
import type { ShaderModule } from '../../shader';

import { useOne, useMemo, useNoMemo } from '../../live';
import { makeShaderBindings } from '../../core';
import { bindingsToLinks, bindBundle } from '../../shader/wgsl';

type Ref<T> = { current: T };

const NO_SOURCES: any[] = [];

// Bind shader sources/constants/lambdas to a loaded shader module
export const useBoundShader = (
  shader: ShaderModule,
  defs: (UniformAttribute | UniformAttributeValue)[],
  values: any[],
  defines?: Record<string, any>,
) => {
  return useMemo(() => getBoundShader(shader, defs, values, defines), [shader, ...defs, ...values, defines]);
}

export const getBoundShader = (
  shader: ShaderModule,
  defs: (UniformAttribute | UniformAttributeValue)[],
  values: any[],
  defines?: Record<string, any>,
) => {
  const bindings = makeShaderBindings<ShaderModule>(defs, values);
  const links = bindingsToLinks(bindings);
  return bindBundle(shader, links, defines);
}

export const useNoBoundShader = useNoMemo;
