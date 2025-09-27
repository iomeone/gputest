import type { ShaderModuleDescriptor } from '@use-gpu/core';
import type { ParsedModule, ParsedBundle, ShaderDefine } from '@use-gpu/shader';

import { toHash } from '@use-gpu/state';
import { resolveBindings, linkBundle, getBundleHash, getBundleKey } from '@use-gpu/shader/wgsl';
import { formatMurmur53, mixBits53, toMurmur53 } from '@use-gpu/state';
import { makeShaderModule } from '@use-gpu/core';
import { useFiber, useMemo, useOne } from '@use-gpu/live';
import { useInspectable } from './useInspectable'
import LRU from 'lru-cache';

const NO_LIBS = {} as Record<string, any>;

type RenderShader = [ShaderModuleDescriptor, ShaderModuleDescriptor];

export const makeShaderCache = (options: Record<number, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

const CACHE = new LRU<string, any>();

export const useLinkedShader = (
  stages: ParsedBundle[],
  defines: Record<string, ShaderDefine> | null | undefined,
) => {
  const fiber = useFiber();
  const inspect = useInspectable();

  // Get hash for defines, shader code, shader instance
  const defKey  = toMurmur53(defines);

  const codeKey = stages.reduce((hash, module) => mixBits53(hash, getBundleHash(module)), 0);
  const dataKey = stages.reduce((hash, module) => mixBits53(hash, getBundleKey(module)), 0);

  const structuralKey = mixBits53(codeKey, defKey);
  const instanceKey   = mixBits53(structuralKey, dataKey);

  // If structural key hasn't changed, we don't need updated modules
  let lazy = true;
  useOne(() => { lazy = false }, structuralKey);

  // Resolve bindings across stages if instance key changed
  const {modules, uniforms, bindings, volatiles} = useOne(() =>
    resolveBindings(stages, defines, lazy),
    instanceKey
  );

  // Keep static set of uniforms/bindings to avoid recreating descriptors unless necessary
  const ref = useOne(() => ({ uniforms, bindings, constants: {} as Record<string, any> }));

  // Link final WGSL if code structure changed.
  const shader = useOne(() => {
    const isCompute = modules.length === 1;
    const suffix = formatMurmur53(defKey);

    const out: ShaderModuleDescriptor[] = [];
    for (const module of modules) {
      const codeKey = getBundleHash(module);
      const key = `${formatMurmur53(codeKey)}-${suffix}`;

      let result = CACHE.get(key);
      if (result == null) {
        const linked = linkBundle(module, NO_LIBS, defines);
        result = makeShaderModule(linked, key);
        CACHE.set(key, result);
      }
      out.push(result);
    }

    inspect({
      compute:   isCompute ? out[0] : null,
      vertex:   !isCompute ? out[0] : null,
      fragment: !isCompute ? out[1] : null,
      uniforms,
      bindings,
      volatiles,
    });

    // Replace uniforms/bindings as structure changed
    ref.uniforms = uniforms;
    ref.bindings = bindings;

    return out;
  }, structuralKey);

  // Update uniform constant values in-place
  useOne(() => {
    for (const u of uniforms) ref.constants[u.uniform.name] = u.constant;
  }, uniforms);

  // Refresh all bindings if buffer assignment changed, as they need new a storage bind group
  const buffers = [] as (GPUBuffer | GPUTexture)[];
  for (const {storage, texture} of bindings) buffers.push(storage?.buffer ?? texture?.view ?? texture?.texture);
  useMemo(() => {
    ref.bindings = bindings;
  }, buffers);

  return {shader, ...ref, volatiles};
};
