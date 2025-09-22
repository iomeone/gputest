import { LiveComponent } from '../live/types';
import { TypedArray, ViewUniforms, UniformPipe, UniformAttribute, UniformType, VertexData, StorageSource } from '../core/types';
import { ViewContext, RenderContext } from '../components';
import { yeet, memoProps, useContext, useMemo, useOne, useState, useResource } from '../live';
import { linkModule } from '../shader';
import {
  makeUniforms, makeUniformBuffer, uploadBuffer,
  makeUniformBindings, makeUniformBlockAccessor,
  makeStorage, makeStorageAccessors, checkStorageTypes,
  makeRenderPipeline, makeShaderModule,
} from '../core';
import partition from 'lodash/partition';

//import vertexShader from './glsl/quads-vertex.glsl';
//import fragmentShader from './glsl/quads-fragment.glsl';

export type QuadsProps = {
  position?: number[] | TypedArray,
  size?: number,

  positions?: StorageSource,
  sizes?: StorageSource,
};

const ZERO = [0, 0, 0, 1];

const DATA_BINDINGS = [
  { name: 'getPosition', format: 'vec4' },
  { name: 'getSize', format: 'float' },
] as UniformAttribute[];

export const Quads: LiveComponent<QuadsProps> = memoProps((fiber) => (props) => {

  const {uniforms, defs} = useContext(ViewContext);
  const renderContext = useContext(RenderContext);
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;
  const {glsl: {compile, modules, cache}} = languages;

  // Data bindings
  const {
    positions,
    position = ZERO,
    sizes,
    size = 1,
  } = props;

  const constantValues = useOne(() => ({
    getPosition: position,
    getSize: size,
  }), props);
  const instanceCount = (positions ?? sizes)?.length || 1;

  // Storage
  const links = useMemo(() => ({
    getPosition: positions,
    getSize: sizes,
  }), [device, positions, sizes]);

  const storageKeys = Object.keys(links);
  const memoKeys = useMemo(() => storageKeys, storageKeys);

  // Shaders and data bindings
  const [vertex, fragment, attributes, constants] = useMemo(() => {

    checkStorageTypes(DATA_BINDINGS, links);
    const [attributes, constants] = partition(DATA_BINDINGS, ({name}) => !!(links as any)[name]);

    const storageAccessors = makeStorageAccessors(attributes, 1);
    const constantAccessors = makeUniformBlockAccessor(constants, 2);
    const accessors = {...storageAccessors, ...constantAccessors};

    const vertexShader = modules['instance/quad/vertex'];
    const fragmentShader = modules['instance/quad/fragment'];

    const vertexLinked = linkModule(vertexShader, modules, accessors, cache);
    const fragmentLinked = linkModule(fragmentShader, modules, accessors, cache);

    const vertex = makeShaderModule(compile(vertexLinked, 'vertex'));
    const fragment = makeShaderModule(compile(fragmentLinked, 'fragment'));

    return [vertex, fragment, attributes, constants];
  }, memoKeys);

  // Rendering pipeline
  const pipeline = useMemo(() =>
    makeRenderPipeline(
      renderContext,
      vertex,
      fragment,
      {
        primitive: {
          topology: "triangle-strip",
          stripIndexFormat: 'uint16',
        },
        vertex:   {},
        fragment: {},
      }
    ),
    [device, vertex, fragment, colorStates, depthStencilState, samples, languages]
  );

  // Uniforms
  const [
    uniform,
    constant,
    storage,
  ] = useMemo(() => {
    const uniform = makeUniforms(device, pipeline, defs, 0);
    const storage = attributes.length ? makeStorage(device, pipeline, links, 1) : null;
    const constant = constants.length ? makeUniforms(device, pipeline, constants, 2) : null;

    return [uniform, constant, storage];
  }, [device, defs, constants, attributes, pipeline, links]);

  // Return a lambda back to parent(s)
  return yeet((passEncoder: GPURenderPassEncoder) => {
    uniform.pipe.fill(uniforms);
    uploadBuffer(device, uniform.buffer, uniform.pipe.data);

    if (constant) {
      constant.pipe.fill(constantValues);
      uploadBuffer(device, constant.buffer, constant.pipe.data);
    }

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniform.bindGroup);
    if (storage) passEncoder.setBindGroup(1, storage);
    if (constant) passEncoder.setBindGroup(2, constant.bindGroup);

    passEncoder.draw(4, instanceCount, 0, 0);
  }); 
}, 'Quads');
