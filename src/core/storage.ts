import type { SharedAllocation, StorageSource, UniformAttribute } from './types';
import { makeBindGroupLayout } from './bindgroup';
import { toTypeString } from './uniform';

export const makeSharedStorage = (
  device: GPUDevice,
  sources: StorageSource[],
): SharedAllocation => {
  const VISIBILITY_ALL = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;

  const group = sources.map((_, binding) => ({binding, visibility: VISIBILITY_ALL, buffer: {type: 'read-only-storage' as GPUBufferBindingType}}));
  const layout = makeBindGroupLayout(device, group);

  const entries = makeStorageEntries(sources);
  const bindGroup = device.createBindGroup({
    layout,
    entries,
  });

  return {layout, bindGroup};
}

export const makeStorageBinding = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  links: Record<string, StorageSource | null | undefined>,
  set: number = 0,
): GPUBindGroup => {
  const sources = [] as StorageSource[];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  for (const k in links) if (links[k]) sources.push(links[k]!);

  const entries = makeStorageEntries(sources);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return bindGroup;
}

export const makeStorageEntries = (
  sources: StorageSource[],
  binding: number = 0
): GPUBindGroupEntry[] => {
  const entries = [] as GPUBindGroupEntry[];

  for (const source of sources) {
    const {buffer, byteOffset, byteLength} = source;
    entries.push({binding, resource: {
      buffer,
      offset: byteOffset,
      size:   byteLength,
    }});
    binding++;
  }

  return entries;
};

export const checkStorageTypes = (
  uniforms: UniformAttribute[],
  links: Record<string, StorageSource | null | undefined>,
) => {
  for (const u of uniforms) {
    const link = links[u.name];
    checkStorageType(u, link)
  }
}

export const checkStorageType = (
  uniform: UniformAttribute,
  link: StorageSource | null | undefined,
) => {
  const {name, format: from} = uniform;
  const to = link?.format;

  if (Array.isArray(from) || Array.isArray(to)) return;

  const fromName = toTypeString(from);
  const toName = toTypeString(to);

  let f = fromName;
  let t = toName;

  if (link && t != null && f !== t) {

    // Remove array<atomic<..>>
    f = f.replace(/array?/, '').replace(/^<|>$/g, '');
    f = f.replace(/atomic?/, '').replace(/^<|>$/g, '');
    t = t.replace(/array?/, '').replace(/^<|>$/g, '');
    t = t.replace(/atomic?/, '').replace(/^<|>$/g, '');

    // Remove vec<..> to allow for automatic widening/narrowing
    f = f.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, '');
    t = t.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, '');

    // Shorthand
    if (f.match(/^uif$/)) f += '32';
    if (f.match(/^h$/))   f = 'f16';
    if (t.match(/^uif$/)) t += '32';
    if (t.match(/^h$/))   t = 'f16';

    if (f !== t) {
      // Remove bit size to allow for automatic widening/narrowing
      const fromScalar = f.replace(/([uif])([0-9]+)/, '$1__');
      const toScalar   = t.replace(/([uif])([0-9]+)/, '$1__');

      if (fromScalar !== toScalar) {
        // uppercase = struct type, allow any
        if (fromName.match(/[A-Z]/) && toName) return;

        console.warn(`Invalid format ${to} bound for ${from} "${name}" (${fromScalar} != ${toScalar})`);
      }
    }
  }
}
