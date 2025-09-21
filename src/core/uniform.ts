import { UniformLayout, UniformAttribute, UniformBinding, UniformType, UniformDefinition, UniformByteSetter, UniformFiller } from './types';
import { UNIFORM_ATTRIBUTE_SIZES } from './constants';
import { UNIFORM_BYTE_SETTERS } from './bytes';

export const getUniformAttributeSize = (format: UniformType): number => UNIFORM_ATTRIBUTE_SIZES[format];
export const getUniformByteSetter = (format: UniformType): UniformByteSetter => UNIFORM_BYTE_SETTERS[format];

export const makeUniforms = (
  uniforms: UniformAttribute[],
  count: number = 1,
): UniformDefinition => {
  const layout = makeUniformLayout(uniforms);
  const data = makeLayoutData(layout, count);
  const fill = makeLayoutFiller(layout, data);

  return {layout, data, fill};
}

export const makeUniformBindings = (
  bindings: UniformBinding[],
  binding: number = 0
): GPUBindGroupEntry[] => {
  const entries = [] as any[];

  for (const {resource} of bindings) {
    entries.push({binding, resource});
    binding++;
  }

  return entries;
};

export const makeUniformLayout = (
  attributes: UniformAttribute[],
  base: number = 0,
): UniformLayout => {
  const out = [] as any[];

  let offset = base;
  for (const {name, format} of attributes) {
    out.push({name, offset, format});
    offset += getUniformAttributeSize(format);
  }

  return {length: offset - base, attributes: out};
};

export const makeLayoutData = (
  layout: UniformLayout,
  count: number = 1,
): ArrayBuffer => {
  const {length} = layout;
  const data = new ArrayBuffer(length * count);
  return data;
}

export const makeLayoutFiller = (
  layout: UniformLayout,
  data: ArrayBuffer,
): UniformFiller => {
  const {length, attributes} = layout;

  const dataView = new DataView(data);

  const setItem = (index: number, item: any) => {
    const base = index * length;
    for (const {name, offset, format} of attributes) {
      const setter = getUniformByteSetter(format);
      setter(dataView, base + offset, item[name].value);
    }
  }

  return (items: any) => {
    let index = 0;
    if (!Array.isArray(items)) setItem(index, items);
    else for (const item of items) {
      setItem(index++, item);
    }
  }
}
