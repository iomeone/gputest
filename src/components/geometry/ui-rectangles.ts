import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, TextureSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/types';

import { ViewContext } from '../providers/view-provider';
import { PickingContext, useNoPicking } from '../render/picking';
import { LayoutContext } from '../providers/layout-provider';
import { render } from './render';

import { patch } from '@use-gpu/state';
import { use, memo, useFiber, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { bindBundle, bindingsToLinks } from '@use-gpu/shader/wgsl';
import { makeShaderBindings } from '@use-gpu/core';

import rectangleVertex from '@use-gpu/wgsl/instance/ui/vertex.wgsl';
import rectangleFragment from '@use-gpu/wgsl/instance/ui/fragment.wgsl';

export type UIRectanglesProps = {
  rectangle?: number[] | TypedArray,
  radius?: number[] | TypedArray,
  border?: number[] | TypedArray,
  stroke?: number[] | TypedArray,
  fill?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  repeat?: number,
  texture?: TextureSource,

  rectangles?: StorageSource,
  radiuses?: StorageSource,
  borders?: StorageSource,
  strokes?: StorageSource,
  fills?: StorageSource,
  uvs?: StorageSource,
  repeats?: StorageSource,

  getRectangle?: ShaderModule,
  getRadius?: ShaderModule,
  getBorder?: ShaderModule,
  getStroke?: ShaderModule,
  getFill?: ShaderModule,
  getUV?: ShaderModule,
  getRepeat?: ShaderModule,
  getTexture?: ShaderModule,

  count?: number,
  
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const ZERO = [0, 0, 0, 1];
const GRAY = [0.5, 0.5, 0.5, 1];
const SQUARE = [0, 0, 1, 1];

const VERTEX_BINDINGS = [
  { name: 'getRectangle', format: 'vec4<f32>', value: ZERO },
  { name: 'getRadius', format: 'vec4<f32>', value: 0 },
  { name: 'getBorder', format: 'vec4<f32>', value: 0 },
  { name: 'getStroke', format: 'vec4<f32>', value: GRAY },
  { name: 'getFill', format: 'vec4<f32>', value: GRAY },
  { name: 'getUV', format: 'vec4<f32>', value: SQUARE },
  { name: 'getRepeat', format: 'i32', value: 0 },
] as UniformAttributeValue[];

const FRAGMENT_BINDINGS = [
  { name: 'getTexture', format: 'vec4<f32>', args: ['vec2<f32>'], value: [0.0, 0.0, 0.0, 0.0] },
] as UniformAttributeValue[];

const DEFINES = {
  STRIP_SEGMENTS: 2,
};

const PIPELINE = {
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
  depthStencil: {
    depthWriteEnabled: false,
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const UIRectangles: LiveComponent<UIRectanglesProps> = memo((props: UIRectanglesProps) => {
  const {
    pipeline: propPipeline,
    mode = RenderPassMode.Opaque,
    id = 0,
    count = 1,
  } = props;

  const vertexCount = 4;
  const instanceCount = props.rectangles?.length ?? count;

  const pipeline = useOne(() => patch(PIPELINE, propPipeline), propPipeline);
  const key = useFiber().id;

  const r = props.rectangles ?? props.rectangle ?? props.getRectangle;
  const a = props.radiuses ?? props.radius ?? props.getRadius;
  const b = props.borders ?? props.border ?? props.getBorder;
  const s = props.strokes ?? props.strokes ?? props.getStroke;
  const f = props.fills ?? props.fill ?? props.getFill;
  const u = props.uvs ?? props.uv ?? props.getUV;
  const p = props.repeats ?? props.repeat ?? props.getRepeat;

  const t = props.texture ?? props.getTexture;

  const [vs, fs] = useMemo(() => {
    const vertexBindings = makeShaderBindings<ShaderModule>(VERTEX_BINDINGS, [r, a, b, s, f, u, p]);
    const fragmentBindings = makeShaderBindings<ShaderModule>(FRAGMENT_BINDINGS, [t]);

    const vs = bindBundle(rectangleVertex, bindingsToLinks(vertexBindings), null, key);
    const fs = bindBundle(rectangleFragment, bindingsToLinks(fragmentBindings), null, key);

    return [vs, fs];
  }, [r, a, b, s, f, u, p, t]);

  return render({
    vertexCount,
    instanceCount,

    vertex: vs,
    fragment: fs,

    defines: DEFINES,
    deps: null,

    pipeline,
    mode,
    id,
  });
}, 'UIRectangles');
