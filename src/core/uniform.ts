import { UniformAllocation, UniformLayout, UniformAttribute, UniformBinding, UniformType, UniformPipe, UniformByteSetter, UniformFiller } from './types';
import { UNIFORM_ATTRIBUTE_SIZES } from './constants';
import { UNIFORM_BYTE_SETTERS } from './bytes';
import { makeUniformBuffer } from './buffer';

export const getUniformAttributeSize = (format: UniformType): number => UNIFORM_ATTRIBUTE_SIZES[format];
export const getUniformByteSetter = (format: UniformType): UniformByteSetter => UNIFORM_BYTE_SETTERS[format];

export const makeUniforms = (
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  uniforms: UniformAttribute[],
  set: number = 0,
): UniformAllocation => {
  const pipe = makeUniformPipe(uniforms);
  const buffer = makeUniformBuffer(device, pipe.data);
  const entries = makeUniformBindings([{resource: {buffer}}]);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(set),
    entries,
  });
  return {pipe, buffer, bindGroup};
}

export const makeUniformPipe = (
  uniforms: UniformAttribute[],
  count: number = 1,
): UniformPipe => {
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
    const s = getUniformAttributeSize(format);

    const o = offset % s;
    if (o) offset += s - o;
    out.push({name, offset, format});

    offset += s;
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
      const o = item[name];
      const v = (o && typeof o === 'object' && o.hasOwnProperty('value'))
        ? o.value : o;
      setter(dataView, base + offset, v);
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

export const makeUniformBlockAccessor = (
  uniforms: UniformAttribute[],
  set: number = 0,
  binding: number = 0,
  ubo: string = 'UBO',
): Record<string, string> => {
  const modules = {} as Record<string, string>;

  const members = uniforms.map(({name, format}) => `${format} ${name}`);
  modules[ubo] = makeUniformBlock(set, binding, ubo, members);

  for (const {name, format} of uniforms) {
    modules[name] = makeUniformGetter(format, ubo, name);
  }

  return modules;
};

export const makeUniformBlock = (set: number, binding: number, ubo: string, members: string[]) => `
#pragma export
layout (set = ${set}, binding = ${binding}) uniform ${ubo}Type {
  ${members.map(m => `${m};`).join('\n  ')}
} ${ubo}Uniform;
`;

export const makeUniformGetter = (type: string, ubo: string, name: string) => `
#pragma import { ${ubo}Uniform } from '#${ubo}'

#pragma export
${type} ${name}() {
  return ${ubo}Uniform.${name};
}

#pragma export
${type} ${name}(int) {
  return ${ubo}Uniform.${name};
}
`;