import { ShaderModuleDescriptor } from '@use-gpu/core/types';
import { ParsedModule, ParsedBundle, ShaderDefine } from '@use-gpu/shader/types';

import { resolveBindings, linkBundle, getProgramHash } from '@use-gpu/shader/wgsl';
import { makeShaderModule } from '@use-gpu/core';
import { useFiber, useMemo, useOne } from '@use-gpu/live';

const NO_DEPS = [] as any[];
const NO_LIBS = {} as Record<string, any>;

export const useLinkedShader = (
  vertex: ParsedBundle,
  fragment: ParsedBundle,
  defines: Record<string, ShaderDefine> | null | undefined,
  deps: any[] | null = null,
  base: number = 0,
  key?: number | string,
) => {
  const fiber = useFiber();

  // Resolve bindings between vertex and fragment.
  const s = [vertex, fragment] as [ParsedBundle, ParsedBundle];
  const {modules, uniforms, bindings} = useMemo(() =>
    resolveBindings(s, defines),
    [...s, defines]
  );

  // Keep static set of bindings
  const ref = useOne(() => ({ uniforms, bindings }));

  // Memoize on specific keys to refresh shader
  const keys = [];
  for (const u of uniforms) keys.push(u.uniform.name);
  keys.push('/');
  for (const b of bindings) keys.push(b.uniform.name);

  // Link final WGSL
  const shader = useMemo(() => {
    const v = linkBundle(modules[0], NO_LIBS, defines);
    const f = linkBundle(modules[1], NO_LIBS, defines);
    const vertex   = makeShaderModule([v, getProgramHash(v)]);
    const fragment = makeShaderModule([f, getProgramHash(f)]);

    fiber.__inspect = fiber.__inspect || {};
    fiber.__inspect.vertex = v;
    fiber.__inspect.fragment = f;

    ref.uniforms = uniforms;
    ref.bindings = bindings;

    return [vertex, fragment, v, f] as [ShaderModuleDescriptor, ShaderModuleDescriptor, string, string];
  }, [...deps ?? NO_DEPS, ...keys]);

  // Update bound uniform values in-place from latest
  useOne(() => {
    let i = 0;
    for (const u of uniforms) {
      if (u.constant != null) {
        ref.uniforms[i].constant = u.constant;
      }
      ++i;
    }
  }, uniforms);

  // Refresh bindings if buffer assignment changed
  const buffers = [] as GPUBuffer[];
  for (const b of bindings) buffers.push(b.storage?.buffer);  
  useMemo(() => {
    ref.bindings = bindings;
  }, buffers);

  return {shader, ...ref};
};
