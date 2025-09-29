import type { DataBinding, StorageSource } from './types';
import { UNIFORM_ATTRIBUTE_SIZES, UNIFORM_ATTRIBUTE_ALIGNS } from './constants';
import { makeUniformLayout } from './uniform';

const BINDING_TEXTURE_TYPES = {
  'texture_1d': { viewDimension: '1d' },

  'texture_2d':                    { viewDimension: '2d' },
  'texture_multisampled_2d':       { viewDimension: '2d', multisampled: true },
  'texture_depth_2d':              { viewDimension: '2d', sampleType: 'depth' },
  'texture_depth_multisampled_2d': { viewDimension: '2d', sampleType: 'depth', multisampled: true },

  'texture_2d_array':         { viewDimension: '2d-array' },
  'texture_depth_2d_array':   { viewDimension: '2d-array', sampleType: 'depth' },

  'texture_cube':       { viewDimension: 'cube' },
  'texture_depth_cube': { viewDimension: 'cube', sampleType: 'depth' },

  'texture_cube_array':       { viewDimension: 'cube-array' },
  'texture_depth_cube_array': { viewDimension: 'cube-array', sampleType: 'depth' },

  'texture_3d': { viewDimension: '3d' },
} as Record<string, Partial<GPUTextureBindingLayout | GPUStorageTextureBindingLayout>>;

const BINDING_STORAGE_TEXTURE_TYPES = {
  'texture_storage_1d':       { viewDimension: '1d' },
  'texture_storage_2d':       { viewDimension: '2d' },
  'texture_storage_2d_array': { viewDimension: '2d-array' },
  'texture_storage_3d':       { viewDimension: '3d' },
} as Record<string, Partial<GPUTextureBindingLayout | GPUStorageTextureBindingLayout>>;

const BINDING_SAMPLE_TYPES = {
  f: 'float',
  u: 'uint',
  i: 'sint',
} as Record<string, GPUTextureSampleType>;

const parseTextureType = (format: string, variant: string | null) => {
  const [layout, type] = format.split(/[<>,]/);
  if (layout in BINDING_TEXTURE_TYPES) {
    const props = BINDING_TEXTURE_TYPES[layout];
    if ('sampleType' in props) return {texture: props};

    if (type && (type[0] in BINDING_SAMPLE_TYPES)) {
      let sampleType = BINDING_SAMPLE_TYPES[type[0]];
      if (sampleType === 'float' && (variant && !variant.match(/^textureSample/))) {
        sampleType = 'unfilterable-float' as GPUTextureSampleType;
      }
      return {texture: {...props, sampleType}};
    }
    throw new Error(`Unknown texture sample type "${format}"`);
  }
  if (layout in BINDING_STORAGE_TEXTURE_TYPES) {
    const props = BINDING_STORAGE_TEXTURE_TYPES[layout];
    return {storageTexture: {...props, format: type as GPUTextureFormat}};
  }
  throw new Error(`Unknown texture layout "${layout}"`);
};

export const makeBindGroupLayoutEntries = (
  bindings: DataBinding[],
  visibilities: GPUShaderStageFlags | Map<DataBinding, GPUShaderStageFlags>,
  binding: number = 0,
): GPUBindGroupLayoutEntry[] => {
  const out = [];
  for (let b of bindings) {
    const v = typeof visibilities === 'number' ? visibilities : (visibilities.get(b) || 7);
    const l = makeBindingLayoutEntry(b, v, out.length + binding);
    if (Array.isArray(l)) out.push(...l);
    else out.push(l);
  }
  return out;
};

export const makeBindingLayoutEntry = (
  b: DataBinding,
  visibility: GPUShaderStageFlags,
  binding: number,
): GPUBindGroupLayoutEntry | GPUBindGroupLayoutEntry[] => {
  if (b.storage) {
    const minBindingSize = getMinBindingSize(b.storage.format);
    if (b.storage!.readWrite) return {binding, visibility, buffer: {type: 'storage', minBindingSize}};
    return {binding, visibility, buffer: {type: 'read-only-storage', minBindingSize}};
  }
  if (b.texture) {
    const hasSampler = !!(b.texture!.sampler && (b.uniform!.args !== null));

    const textureType = b.uniform.args ? b.texture.layout : (b.uniform.format as string);
    const textureVariant = b.texture.variant ?? (b.uniform.args ? null : 'textureLoad');

    const props = parseTextureType(textureType, textureVariant);

    const texture = {binding, visibility, ...props};

    if (hasSampler) {
      const type = (b.texture!.comparison ? 'comparison' : 'filtering') as GPUSamplerBindingType;
      const sampler = {binding: binding + 1, visibility, sampler: {type}};
      return [texture, sampler];
    }
    return texture;
  }
  throw new Error(`Cannot generate bind group layout entry for binding '${b.uniform.name}'`);
};

export const makeUniformLayoutEntry = (
  uniforms: any[],
  visibility: GPUShaderStageFlags,
  binding: number = 0,
) => {
  if (!uniforms.length) return null;
  return {binding, visibility, buffer: {}};
};

export const makeBindGroupLayout = (
  device: GPUDevice,
  entries: GPUBindGroupLayoutEntry[],
) => {
  return device.createBindGroupLayout({
    entries,
  });
}

export const makeBindGroup = (
  device: GPUDevice,
  layout: GPUBindGroupLayout,
  entries: GPUBindGroupEntry[],
) => {
  return device.createBindGroup({
    layout,
    entries,
  });
}

export const getMinBindingSize = (format: string | any) => {
  if (typeof format === 'string') {
    format = format.replace(/^array<([^>]+)>$/, '$1');
    format = format.replace(/^vec3to4</, 'vec4<');
    format = format.replace(/^(u|i)(8|16)$/, 'u32');
    const size = (UNIFORM_ATTRIBUTE_SIZES as any)[format] ?? 0;
    const align = (UNIFORM_ATTRIBUTE_ALIGNS as any)[format] ?? 0;
    return align ? Math.ceil(size / align) * align : size;
  }
  if (!format) return 0;

  const {module} = format;
  const {entry, table: {declarations}} = module;
  const {struct} = declarations.find((d: any) => d.struct?.name === entry);
  if (!struct) return 0;

  const members = struct.members.map((m: any) => ({name: m.name, format: toTypeString(m.type)}));
  const layout = makeUniformLayout(members);
  return layout.length;
};

export const toTypeString = (t: any | string): string => {
  if (typeof t === 'object') {
    if (t.type) return toTypeString(t.type);
    if (t.args) return `${t.name}<${t.args.map((t: any) => toTypeString(t)).join(',')}>`;
    else return t.name;
  }
  return t;
}

export const toTypeArgs = (t: (any | string)[]): string[] => {
  return t?.map(toTypeString) ?? [];
}

const maximum = (a: number, b: number) => Math.max(a, b);
const alignAdd = (a: number, b: number) => Math.ceil(a / b) * b + b;
