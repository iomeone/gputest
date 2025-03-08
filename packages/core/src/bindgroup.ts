import type { DataBinding, RawBinding, ShaderStructType, UniformFormat, UniformAttribute } from './types';
import { UNIFORM_ATTRIBUTE_SIZES, UNIFORM_ATTRIBUTE_ALIGNS } from './constants';
import { makeUniformLayout, toTypeString } from './uniform';

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

/**
 * Parse texture format and sampler variant into binding properties
 */
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

/**
 * Make bind group layout entries for the given data bindings and visibilities.
 */
export const makeBindGroupLayoutEntries = (
  bindings: (DataBinding | RawBinding)[],
  visibilities: GPUShaderStageFlags | Map<DataBinding | RawBinding, GPUShaderStageFlags> | GPUShaderStageFlags[],
  binding: number = 0,
): GPUBindGroupLayoutEntry[] => {
  const out = [];
  let i = 0;
  for (const b of bindings) {
    const v = typeof visibilities === 'number' ? visibilities : Array.isArray(visibilities) ? visibilities[i] : (visibilities.get(b) || 7);
    const l = makeBindGroupLayoutEntry(b, v, out.length + binding);
    if (Array.isArray(l)) out.push(...l);
    else out.push(l);
    ++i;
  }
  return out;
};

/**
 * Make a bind group layout entry for a given data binding and visibility.
 */
export const makeBindGroupLayoutEntry = (
  b: DataBinding | RawBinding,
  visibility: GPUShaderStageFlags,
  binding: number,
): GPUBindGroupLayoutEntry | GPUBindGroupLayoutEntry[] => {
  if (b.uniform != null) {
    const minBindingSize = getMinBindingSize(b.uniform.format, b.uniform.type ?? b.attribute.type);
    return {binding, visibility, buffer: {type: 'uniform', minBindingSize}};
  }
  if (b.storage != null) {
    const minBindingSize = getMinBindingSize(b.storage.format, b.storage.type ?? b.attribute.type);
    if (b.storage.readWrite) return {binding, visibility, buffer: {type: 'storage', minBindingSize}};
    return {binding, visibility, buffer: {type: 'read-only-storage', minBindingSize}};
  }
  if (b.texture != null) {
    const hasSampler = !!(b.texture.sampler && (b.attribute.args !== null));

    const textureType = b.attribute.args ? b.texture.layout : (b.attribute.format as string);
    const textureVariant = b.texture.variant ?? (b.attribute.args ? null : 'textureLoad');

    const props = parseTextureType(textureType, textureVariant);

    const texture = {binding, visibility, ...props};

    if (hasSampler) {
      const isDepth = textureType.match(/_depth(_|$)/);

      const filter = isDepth ? 'non-filtering' : 'filtering' as GPUSamplerBindingType;
      const type = (b.texture.filter ?? filter) as GPUSamplerBindingType;
      const sampler = {binding: binding + 1, visibility, sampler: {type}};

      return [texture, sampler];
    }
    return texture;
  }
  if (b.sampler != null) {
    const filter = 'filtering' as GPUSamplerBindingType;
    const type = (b.sampler.filter ?? filter) as GPUSamplerBindingType;
    const sampler = {binding: binding, visibility, sampler: {type}};
    return sampler;
  }
  throw new Error(`Cannot generate bind group layout entry for binding '${b.attribute.name}'`);
};

export const makeUniformLayoutEntry = (
  attributes: any[],
  visibility: GPUShaderStageFlags,
  binding: number = 0,
) => {
  if (!attributes.length) return null;
  return {binding, visibility, buffer: {}};
};

export const makeBindGroupLayout = (
  device: GPUDevice,
  entries: GPUBindGroupLayoutEntry[],
  label?: string,
) => {
  return device.createBindGroupLayout({
    entries,
    label,
  });
}

export const makeBindGroup = (
  device: GPUDevice,
  layout: GPUBindGroupLayout,
  entries: GPUBindGroupEntry[],
  label?: string,
) => {
  return device.createBindGroup({
    layout,
    entries,
    label,
  });
}

/**
 * Compute minimum binding size in bytes for a given attribute.
 */
export const getMinBindingSize = (
  format: UniformFormat | UniformAttribute[],
  type?: ShaderStructType,
) => {
  if (type) {
    const module = (type.module ?? type) as any;
    const entry = type.entry ?? module.entry;
    const {table: {exports}} = module;

    const decl = exports?.find((d: any) => d.struct?.name === entry);
    if (!decl) {
      console.warn('getMinBindingSize = 0. Struct declaration not found. Does it have `@export`?', {format, type})
      return 0;
    }

    const {struct} = decl;
    const members = struct.format ?? struct.members.map((m: any) => ({name: m.name, format: toTypeString(m.type)}));

    try {
      const layout = makeUniformLayout(members);
      return layout.length;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // TODO: resolve arrays of structs inside structs
      return 0;
    }
  }

  if (Array.isArray(format)) {
    const layout = makeUniformLayout(format);
    return layout.length;
  }
  else if (typeof format === 'string') {
    let f = format as string;
    f = f.replace(/^array<([^>]+)>$/, '$1');
    f = f.replace(/^vec3to4</, 'vec4<');
    f = f.replace(/^(u|i)(8|16)$/, 'u32');

    if (f === 'T') {
      console.warn('Unresolved structure type', {format, type});
      return 0;
    }

    const size = (UNIFORM_ATTRIBUTE_SIZES as any)[f] ?? 0;
    const align = (UNIFORM_ATTRIBUTE_ALIGNS as any)[f] ?? 0;
    return align ? Math.ceil(size / align) * align : size;
  }

  console.warn('getMinBindingSize = 0', {format, type})
  return 0;
};

/**
 * Merge static attributes in a @group(...) across one or more pipeline stages,
 * and return per-stage visibility.
 */
export const mergeAttributeBindings = (
  stages: UniformAttribute[][],
  pass: string,
): [
  UniformAttribute[],
  GPUShaderStageFlags[],
] => {
  
  const key = pass;
  const n = stages.length;

  const allBindings: UniformAttribute[] = [];
  const allVisibilities: GPUShaderStageFlags[] = [];

  let i = 0;
  for (const stage of stages) {
    const visibility = n === 2
      ? (i ? GPUShaderStage.FRAGMENT : GPUShaderStage.VERTEX)
      : GPUShaderStage.COMPUTE;

    for (const attribute of stage) {
      const {attr} = attribute;

      const location = attr?.find((k: string) => k.match(/^binding\(/));
      const index = parseInt(location?.split(/[()]/g)[1] ?? '', 10);
      if (Number.isNaN(index)) throw new Error(`Binding without location: '${attribute.name}' ${attr?.join(' ')}`);

      if (!allBindings[index]) allBindings[index] = attribute;
      else if (
        allBindings[index].name != attribute.name ||
        allBindings[index].format != attribute.format ||
        (allBindings[index].type as any)?.key != (attribute.type as any)?.key
      ) throw new Error(`Conflicting static binding in '@${key}' for index '${index}':\n'${allBindings[index].name}' vs '${attribute.name}'`);

      allVisibilities[index] = (allVisibilities[index] || 0) | visibility;
    }
    ++i;
  }

  return [allBindings, allVisibilities];
};

/**
 * Create a raw placeholder binding for an attribute
 */
export const makeRawBindingForAttribute = (
  attribute: UniformAttribute,
): RawBinding => {
  const {type, format, qual} = attribute;

  const [layout] = Array.isArray(format) ? [''] : (format as string).split(/[<>,]/);
  const parts = layout.split('_');

  if (qual?.match(/\bstorage\b/)) {
    const readWrite = !!qual.match(/\bread_write\b/);
    return {attribute, storage: {format, readWrite}};
  }

  else if (qual?.match(/\buniform\b/)) {
    return {attribute, uniform: {type, format}};
  }

  else if (parts.includes('texture')) {
    return {attribute, texture: {layout: format as any, sampler: null}};
  }
  else if (parts.includes('sampler')) {
    const filter = (parts.includes('comparison') ? 'comparison' : 'filtering') as GPUSamplerBindingType;
    return {attribute, sampler: {sampler: {}, filter}};
  }

  throw new Error(`Cannot make raw binding for 'var${qual ?? ''} ${name}: ${format}'`);
}
