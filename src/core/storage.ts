import type { StorageSource, UniformAttribute, DataBinding } from './types';

export const makeStorageBinding = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  links: Record<string, StorageSource | null | undefined>,
  set: number = 0,
): GPUBindGroup => {
  const entries = makeStorageEntries(links);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return bindGroup;
}

export const makeStorageEntries = (
  links: Record<string, StorageSource | null | undefined>,
  binding: number = 0
): GPUBindGroupEntry[] => {
  const entries = [] as any[];

  for (const k in links) {
    const link = links[k];
    if (link) {
      const {buffer} = link;
      entries.push({binding, resource: {buffer}});
      binding++;
    }
  }

  return entries;
};

const toTypeName = (s: any) => s?.module?.entry ?? s;

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

  const f = toTypeName(from);
  const t = toTypeName(to);
  
  if (link && t != null && f !== t) {
    // Remove vec<..> to allow for automatic widening/narrowing
    const fromVec = f.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, '');
    const toVec   = t.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, ''); 

    if (fromVec !== toVec) {
      // Remove bit size to allow for automatic widening/narrowing
      const fromScalar = fromVec.replace(/([uif])([0-9]+)/, '$1__');
      const toScalar   =   toVec.replace(/([uif])([0-9]+)/, '$1__');

      if (fromScalar !== toScalar) {
        console.warn(`Invalid format ${to} bound for ${from} "${name}" (${fromScalar} != ${toScalar})`);
      }
    }
  }
} 
