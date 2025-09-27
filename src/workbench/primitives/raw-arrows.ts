import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { ViewContext } from '../providers/view-provider';
import { Virtual } from './virtual';

import { patch } from '@use-gpu/state';
import { use, yeet, memo, useCallback, useOne } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, bundleToAttributes } from '@use-gpu/shader/wgsl';
import { makeShaderBindings, resolve } from '@use-gpu/core';

import { makeArrow } from './mesh/arrow';
import { RawData } from '../data/raw-data';
import { useRawSource } from '../hooks/useRawSource';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';

import { getArrowVertex } from '@use-gpu/wgsl/instance/vertex/arrow.wgsl';
import { getPassThruFragment } from '@use-gpu/wgsl/mask/passthru.wgsl';

export type RawArrowsProps = {
  anchor?: number[] | TypedArray,
  position?: number[] | TypedArray,
  color?: number[] | TypedArray,
  size?: number,
  width?: number,
  depth?: number,

  anchors?:   ShaderSource,
  positions?: ShaderSource,
  colors?:    ShaderSource,
  sizes?:     ShaderSource,
  widths?:    ShaderSource,
  depths?:    ShaderSource,

  lookups?:   ShaderSource,

  detail?: number,

  count?: number,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode,
  id?: number,
};

const ZERO = [0, 0, 0, 1];

const VERTEX_BINDINGS = bundleToAttributes(getArrowVertex);

const PIPELINE = {
  primitive: {
    topology: 'triangle-list',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

const DEFINES: Record<string, any> = {};

export const RawArrows: LiveComponent<RawArrowsProps> = memo((props: RawArrowsProps) => {
  const {
    pipeline: propPipeline,
    detail = 12,
    count = 1,
    mode = 'opaque',
    id = 0,
  } = props;
  
  const det = Math.max(4, detail);
  const mesh = useOne(() => makeArrow(det), det);

  // Set up draw
  const vertexCount = mesh.count;
  const instanceCount = useCallback(() => ((props.anchors as any)?.length ?? resolve(count)), [props.anchors, count]);
  
  const pipeline = useOne(() => patch(PIPELINE, propPipeline), propPipeline);

  const a = useShaderRef(props.anchor, props.anchors);
  const p = useShaderRef(props.position, props.positions);
  const c = useShaderRef(props.color, props.colors);
  const e = useShaderRef(props.size, props.sizes);
  const w = useShaderRef(props.width, props.widths);
  const d = useShaderRef(props.depth, props.depths);

  const l = useShaderRef(null, props.lookups);
  
  const g = useRawSource(mesh.vertices[0], 'vec4<f32>');
  const xf = useApplyTransform(p);

  const getVertex = useBoundShader(getArrowVertex, VERTEX_BINDINGS, [g, a, xf, c, e, w, d, l]);
  const getFragment = getPassThruFragment;

  return (
     use(Virtual, {
      vertexCount,
      instanceCount,

      getVertex,
      getFragment,

      defines: DEFINES,

      pipeline,
      mode,
      id,
    })
  );
}, 'RawArrows');


