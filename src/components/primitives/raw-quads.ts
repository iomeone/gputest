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
import { makeShaderBindings, resolve } from '@use-gpu/core';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';

import { getQuadVertex } from '@use-gpu/wgsl/instance/vertex/quad.wgsl';
import { getMaskedFragment } from '@use-gpu/wgsl/mask/masked.wgsl';

export type RawQuadsProps = {
  position?: number[] | TypedArray,
  rectangle?: number[] | TypedArray,
  color?: number[],
  depth?: number,
  mask?: number,
  uv?: number[] | TypedArray,

  positions?: ShaderSource,
  rectangles?: ShaderSource,
  colors?: ShaderSource,
  depths?: ShaderSource,
  masks?: ShaderSource,
  uvs?: ShaderSource,

  texture?: TextureSource | LambdaSource | ShaderModule,

  alphaToCoverage?: boolean,
  count?: Prop<number>,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const VERTEX_BINDINGS = bundleToAttributes(getQuadVertex);
const FRAGMENT_BINDINGS = bundleToAttributes(getMaskedFragment);

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


const DEFINES = {
  HAS_EDGE_BLEED: true,
};

const PIPELINE = {
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const RawQuads: LiveComponent<RawQuadsProps> = memo((props: RawQuadsProps) => {
  const {
    pipeline: propPipeline,
    alphaToCoverage = true,
    mode = RenderPassMode.Opaque,
    id = 0,
    count = 1,
  } = props;

  const vertexCount = 4;
  const instanceCount = useCallback(() => (props.positions?.length ?? resolve(count)), [props.positions, count]);

  const pipeline = useMemo(() =>
    patch(alphaToCoverage
      ? PIPELINE_ALPHA_TO_COVERAGE
      : PIPELINE,
    propPipeline),
    [propPipeline, alphaToCoverage]);

  const key = useFiber().id;

  const p = useShaderRef(props.position, props.positions);
  const r = useShaderRef(props.rectangle, props.rectangles);
  const c = useShaderRef(props.color, props.colors);
  const d = useShaderRef(props.depth, props.depths);
  const u = useShaderRef(props.uv, props.uvs);

  const m = (mode !== RenderPassMode.Debug) ? (props.masks ?? props.mask) : null;
  const t = props.texture;
  
  const xf = useApplyTransform(p);
  
  const getVertex = useBoundShader(getQuadVertex, VERTEX_BINDINGS, [xf, r, c, d, u]);
  const getFragment = useBoundShader(getMaskedFragment, FRAGMENT_BINDINGS, [m, t]);

  return use(Virtual, {
    vertexCount,
    instanceCount,

    getVertex,
    getFragment,

    defines: alphaToCoverage ? DEFINES_ALPHA_TO_COVERAGE : DEFINES_ALPHA,
    deps: null,

    pipeline,
    mode,
    id,
  });
}, 'RawQuads');
