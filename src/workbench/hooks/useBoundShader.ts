import type { UniformAttribute, UniformAttributeValue } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useOne, useMemo, useNoMemo } from '@use-gpu/live';
import { makeShaderBindings } from '@use-gpu/core';
import { bindingsToLinks, bindBundle, bundleToAttributes } from '@use-gpu/shader/wgsl';

type Ref<T> = { current: T };

const NO_SOURCES: any[] = [];

// Removed attributes array
let WARN_DEPRECATED = false;

// Bind shader sources/constants/lambdas to a loaded shader module
export const useBoundShader = (
  shader: ShaderModule,
  values: any[],
  defines?: Record<string, any>,
  _deprecated?: any,
) => {
  if (Array.isArray(defines)) {
    return useMemo(() => getBoundShader(shader, defines as any, _deprecated), [shader, ...defines, _deprecated]);
  }
  return useMemo(() => getBoundShader(shader, values, defines), [shader, ...values, defines]);
}

export const getBoundShader = (
  shader: ShaderModule,
  values: any[],
  defines?: Record<string, any>,
  _deprecated?: any,
) => {
  let attributes = (shader as any).attributes;
  if (!attributes) attributes = (shader as any).attributes = bundleToAttributes(shader);
  
  if (Array.isArray(defines)) {
    [values, defines] = [defines, _deprecated] as any;
    if (!WARN_DEPRECATED) {
      WARN_DEPRECATED = true;
      console.warn(`
DEPRECATED - useBoundShader attributes array has been removed
  Replace:   useBoundShader(A, B, C, ...)
  with:      useBoundShader(A, C, ...)
`);
    }
  }
  
  const bindings = makeShaderBindings<ShaderModule>(attributes, values);
  const links = bindingsToLinks(bindings);
  return bindBundle(shader, links, defines);
}

export const useNoBoundShader = useNoMemo;
