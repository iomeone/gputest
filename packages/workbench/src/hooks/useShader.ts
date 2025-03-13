import type { ShaderModule } from '@use-gpu/shader';

import { useMemo, useNoMemo } from '@use-gpu/live';
import { makeShaderBindings } from '@use-gpu/core';
import { bindingsToModules, bindBundle, bundleToAttributes } from '@use-gpu/shader/wgsl';

// Bind shader sources/constants/lambdas to a loaded shader module
export const useShader = (
  shader: ShaderModule,
  values: any[],
  defines?: Record<string, any>,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getShader(shader, values, defines), [shader, ...values, defines]);
}

export const getShader = (
  shader: ShaderModule,
  values: any[],
  defines?: Record<string, any>,
) => {
  let attributes = (shader as any).attributes;
  if (!attributes) attributes = (shader as any).attributes = bundleToAttributes(shader);

  const bindings = makeShaderBindings<ShaderModule>(attributes, values) as any;
  const links = bindingsToModules(bindings);

  return bindBundle(shader, links, defines);
}

export const useNoShader = useNoMemo;
