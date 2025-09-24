import { StorageSource, UniformAttribute, DataBinding } from './types';

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
  const {name, format} = uniform;
  //if (link && link.format !== format) throw new Error(`Invalid format ${link.format} bound for ${format} "${name}"`);
  if (link && link.format !== format) console.warn(`Invalid format ${link.format} bound for ${format} "${name}"`);
} 

export const makeStorageAccessors = (
  uniforms: UniformAttribute[],
  set: number = 0,
  binding: number = 0,
): Record<string, string> => {
  const modules = {} as Record<string, string>;

  for (const {name, format} of uniforms) {
    modules[name] = makeStorageAccessor(set, binding, format, name);
    binding++;
  }

  return modules;
};

export const makeStorageAccessor = (set: number, binding: number, type: string, name: string) => `
layout (std430, set = ${set}, binding = ${binding}) readonly buffer ${name}Type {
  ${type} data[];
} ${name}Storage;

#pragma export
${type} ${name}(int index) {
  return ${name}Storage.data[index];
}
`;