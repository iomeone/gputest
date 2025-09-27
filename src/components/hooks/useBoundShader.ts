import { UniformAttributeValue } from '../../core/types';
import { ShaderModule } from '../../shader/wgsl/types';

import { useOne, useMemo, useVersion } from '../../live';
import { makeShaderBindings } from '../../core';
import { bindingsToLinks, bindBundle } from '../../shader/wgsl';

type Ref<T> = { current: T };

const NO_SOURCES: any[] = [];

// Bind shader sources/constants/lambdas to a loaded shader module
export const useBoundShader = (
  shader: ShaderModule,
  defs: UniformAttributeValue[],
  values: any[],
  defines?: Record<string, any>,
) => {
  return useMemo(() => {
    const bindings = makeShaderBindings<ShaderModule>(defs, values);
    const links = bindingsToLinks(bindings);
    return bindBundle(shader, links, defines);
  }, [shader, defs, ...values, defines]);
}
