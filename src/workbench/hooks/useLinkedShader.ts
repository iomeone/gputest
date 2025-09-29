import type { ShaderModuleDescriptor } from '@use-gpu/core';
import type { ParsedModule, ParsedBundle, ShaderDefine } from '@use-gpu/shader';

import { toHash } from '@use-gpu/state';
import { resolveBindings, linkBundle, getBundleHash, getBundleKey } from '@use-gpu/shader/wgsl';
import { formatMurmur53, mixBits53, toMurmur53 } from '@use-gpu/state';
import { makeShaderModuleDescriptor, makeBindGroupLayoutEntries, makeUniformLayoutEntry } from '@use-gpu/core';
import { useFiber, useMemo, useOne } from '@use-gpu/live';
import { useForceUpdate } from './useForceUpdate';
import { useInspectable } from './useInspectable';
import LRU from 'lru-cache';

const NO_LIBS = {} as Record<string, any>;

type RenderShader = [ShaderModuleDescriptor, ShaderModuleDescriptor];

const VERSION_CACHE = new LRU<string, number>();
const MODULE_CACHE = new LRU<string, any>();
const LAYOUT_CACHE = new LRU<number, any>();

export const useLinkedShader = (
  stages: (ParsedBundle | null | undefined)[],
  defines: Record<string, ShaderDefine> | null | undefined,
) => {
  const fiber = useFiber();
  const inspect = useInspectable();

  // Live shader editing (persistent within mount only)
  const [version, invalidateFiber] = useForceUpdate();
  const hot = useOne(() => new Map<string, string | null>());

  // Get hash for defines, shader code, shader instance
  const defKey  = toMurmur53(defines);

  const codeKey = stages.reduce((hash, module) => mixBits53(hash, module ? getBundleHash(module) : 0), 0);
  const dataKey = stages.reduce((hash, module) => mixBits53(hash, module ? getBundleKey(module) : 0), 0);

  const structuralKey = mixBits53(codeKey, defKey);
  const instanceKey   = mixBits53(structuralKey, dataKey);

  // If structural key hasn't changed, we don't need updated modules
  let lazy = true;
  useOne(() => { lazy = false }, structuralKey);

  // Resolve bindings across stages if instance key changed
  const {modules, uniforms, bindings, volatiles, visibilities} = useOne(() =>
    resolveBindings(stages, defines, lazy),
    instanceKey
  );

  // Generate bind group layout
  const entries = useOne(() => {
    const cached = LAYOUT_CACHE.get(codeKey);
    if (cached) return cached;

    const visibility = modules.length === 2
      ? GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
      : GPUShaderStage.COMPUTE;

    const bindingsEntries  = makeBindGroupLayoutEntries(bindings, visibilities);
    const volatilesEntries = makeBindGroupLayoutEntries(volatiles, visibilities);
    const uniformEntry     = makeUniformLayoutEntry(uniforms, visibility, bindingsEntries.length);

    const entries = [];
    entries.push(uniformEntry ? [...bindingsEntries, uniformEntry] : bindingsEntries);
    if (volatilesEntries.length) entries.push(volatilesEntries);

    LAYOUT_CACHE.set(codeKey, entries);
    return entries;
  }, codeKey);

  // Keep static set of uniforms/bindings to avoid recreating descriptors unless necessary
  const ref = useOne(() => ({
    uniforms,
    bindings,
    constants: {} as Record<string, any>,
    entries,
  }));

  // Link final WGSL if code structure changed.
  const shader = useOne(() => {
    const isCompute = modules.length === 1;
    const suffix = formatMurmur53(defKey);

    const out: ShaderModuleDescriptor[] = [];
    for (const module of modules) if (module) {
      const {module: {entry}} = module;
      const codeKey = getBundleHash(module);
      const key = `${formatMurmur53(codeKey)}-${suffix}`;

      let result = MODULE_CACHE.get(key);
      if (result == null) {
        const linked = hot.get(key) ?? linkBundle(module, NO_LIBS, defines);
        const version = (VERSION_CACHE.get(key) ?? 0) + 1;
        VERSION_CACHE.set(key, version);
        result = makeShaderModuleDescriptor(linked, `${key}-${version}`, entry);
        MODULE_CACHE.set(key, result);
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
      updateShader: (keyVersion: string, code?: string) => {
        const key = keyVersion.split('-').slice(0, 2).join('-');
        hot.set(key, code ?? null);
        MODULE_CACHE.set(key, null);
        invalidateFiber();
      },
    });

    // Replace uniforms/bindings/entries as structure changed
    ref.uniforms = uniforms;
    ref.bindings = bindings;
    ref.entries  = entries;

    return out;
  }, structuralKey ^ version);

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
