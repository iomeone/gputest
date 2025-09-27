import { LiveComponent } from '../../live/types';
import {
  TypedArray, ViewUniforms, DeepPartial, Prop,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, ShaderSource, RenderPassMode,
} from '../../core/types';
import { ShaderModule } from '../../shader/types';

import { ViewContext } from '../providers/view-provider';
import { PickingContext, useNoPicking } from '../render/picking';
import { Virtual } from './virtual';

import { patch } from '../../state';
import { use, yeet, memo, useCallback, useFiber, useMemo, useOne, useState, useResource } from '../../live';
import { bindBundle, bindingsToLinks, bundleToAttributes } from '../../shader/wgsl';
import { resolve, makeShaderBindings } from '../../core';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';

import { getLineVertex } from '../../gen-wgsl/instance/vertex/line';
import { getPassThruFragment } from '../../gen-wgsl/mask/passthru';

export type RawLinesProps = {
  position?: number[] | TypedArray,
  segment?: number,
  color?: number[] | TypedArray,
  width?: number,
  depth?: number,
  trim?: number[] | TypedArray,
  size?: number,

  indices?: ShaderSource,
  positions?: ShaderSource,
  segments?: ShaderSource,
  colors?: ShaderSource,
  widths?: ShaderSource,
  depths?: ShaderSource,
  trims?: ShaderSource,
  sizes?: ShaderSource,

  join?: 'miter' | 'round' | 'bevel',

  count?: Prop<number>,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode,
  id?: number,
};

const ZERO = [0, 0, 0, 1];

const VERTEX_BINDINGS = bundleToAttributes(getLineVertex);

const LINE_JOIN_SIZE = {
  'bevel': 1,
  'miter': 2,
  'round': 4,
} as Record<string, number>;

const LINE_JOIN_STYLE = {
  'bevel': 0,
  'miter': 1,
  'round': 2,
} as Record<string, number>;

const PIPELINE = {
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const RawLines: LiveComponent<RawLinesProps> = memo((props: RawLinesProps) => {
  const {
    pipeline: propPipeline,
    count = 2,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  // Customize line shader
  let {join, depth = 0} = props;
  const j = (join! in LINE_JOIN_SIZE) ? join! : 'bevel';

  const style = LINE_JOIN_STYLE[j];
  const segments = LINE_JOIN_SIZE[j];
  const tris = (1+segments) * 2;
  const defines = {
    LINE_JOIN_STYLE: style,
    LINE_JOIN_SIZE: segments,
  };

  // Set up draw
  const vertexCount = 2 + tris;
  const instanceCount = useCallback(() => ((props.positions?.length ?? resolve(count)) || 2) - 1, [props.positions, count]);

  const pipeline = useOne(() => patch(PIPELINE, propPipeline), propPipeline);
  const key = useFiber().id;

  const p = useShaderRef(props.position, props.positions);
  const g = useShaderRef(props.segment, props.segments);
  const c = useShaderRef(props.color, props.colors);
  const w = useShaderRef(props.width, props.widths);
  const d = useShaderRef(props.depth, props.depths);
  const t = useShaderRef(props.trim, props.trims);
  const z = useShaderRef(props.size, props.sizes);

  const xf = useApplyTransform(p);

  const getVertex = useBoundShader(getLineVertex, VERTEX_BINDINGS, [xf, g, c, w, d, t, z]);
  const getFragment = getPassThruFragment;
  
  return use(Virtual, {
    vertexCount,
    instanceCount,

    getVertex,
    getFragment,

    defines,
    deps: [j],

    pipeline,
    mode,
    id,
  });
}, 'RawLines');
