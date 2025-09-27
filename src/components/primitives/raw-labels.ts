import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, DeepPartial, Prop,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, ShaderSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/types';

import { ViewContext } from '../providers/view-provider';
import { PickingContext, useNoPicking } from '../render/picking';
import { Virtual } from './virtual';

import { patch } from '@use-gpu/state';
import { use, memo, useCallback, useFiber, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, bundleToAttributes } from '@use-gpu/shader/wgsl';
import { makeShaderBindings, resolve, BLEND_ALPHA } from '@use-gpu/core';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';

import { getLabelVertex } from '@use-gpu/wgsl/instance/vertex/label.wgsl';
import { getUIFragment } from '@use-gpu/wgsl/instance/fragment/ui.wgsl';

export type RawLabelsProps = {
  index?: number,
  indices?: ShaderSource,

  rectangle?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  layout?: number[] | TypedArray,
  sdf?: number,

  position?: number[] | TypedArray,
  placement?: number[] | TypedArray,
  density?: number[] | TypedArray,
  offset?: number,
  size?: number,
  depth?: number,
  color?: number,
  outline?: number,
  outlineColor?: number[] | TypedArray,

  rectangles?: ShaderSource,
  uvs?: ShaderSource,
  layouts?: ShaderSource,
  sdfs?: ShaderSource,

  positions?: ShaderSource,
  placements?: ShaderSource,
  densities?: ShaderSource,
  offsets?: ShaderSource,
  sizes?: ShaderSource,
  depths?: ShaderSource,
  colors?: ShaderSource,
  outlines?: ShaderSource,
  outlineColors?: ShaderSource,

  texture?: TextureSource | LambdaSource | ShaderModule,

  alphaToCoverage?: boolean,
  count?: Prop<number>,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const VERTEX_BINDINGS = bundleToAttributes(getLabelVertex);
const FRAGMENT_BINDINGS = bundleToAttributes(getUIFragment);

const DEFINES_ALPHA = {
  HAS_EDGE_BLEED: true,
  HAS_ALPHA_TO_COVERAGE: false,
};

const DEFINES_ALPHA_TO_COVERAGE = {
  HAS_EDGE_BLEED: true,
  HAS_ALPHA_TO_COVERAGE: true,
};

const PIPELINE_ALPHA = {
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

const PIPELINE_ALPHA_TO_COVERAGE = {
  fragment: {
    targets: {
      0: { blend: {$set: undefined}, },
    },
  },
  multisample: {
    alphaToCoverageEnabled: true,
  },
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const RawLabels: LiveComponent<RawLabelsProps> = memo((props: RawLabelsProps) => {
  const {
    pipeline: propPipeline,
    alphaToCoverage = true,
    mode = RenderPassMode.Opaque,
    id = 0,
    count = 1,
  } = props;

  const vertexCount = 4;
  const instanceCount = useCallback(() => (props.indices?.length ?? resolve(count)), [props.indices, count]);

  const pipeline = useMemo(() =>
    patch(alphaToCoverage
      ? PIPELINE_ALPHA_TO_COVERAGE
      : PIPELINE,
    propPipeline),
    [propPipeline, alphaToCoverage]);

  const key = useFiber().id;

  const i = useShaderRef(props.index, props.indices);
  const r = useShaderRef(props.rectangle, props.rectangles);
  const u = useShaderRef(props.uv, props.uvs);
  const l = useShaderRef(props.layout, props.layouts);
  const a = useShaderRef(props.sdf, props.sdfs);

  const p = useShaderRef(props.position, props.positions);
  const c = useShaderRef(props.placement, props.placements);
  const o = useShaderRef(props.offset, props.offsets);
  const z = useShaderRef(props.size, props.sizes);
  const d = useShaderRef(props.depth, props.depths);
  const f = useShaderRef(props.color, props.colors);
  const e = useShaderRef(props.expand, props.expands);

  const xf = useApplyTransform(p);

  const t = props.texture;

  const getVertex = useBoundShader(getLabelVertex, VERTEX_BINDINGS, [i, r, u, l, a, xf, c, o, z, d, f, e]);
  const getFragment = useBoundShader(getUIFragment, FRAGMENT_BINDINGS, [t]);

  return use(Virtual, {
    vertexCount,
    instanceCount,

    getVertex,
    getFragment,

    defines: alphaToCoverage ? DEFINES_ALPHA_TO_COVERAGE : DEFINES_ALPHA,
    deps: null,

    renderer: 'ui',
    pipeline,
    mode,
    id,
  });
}, 'RawLabels');
