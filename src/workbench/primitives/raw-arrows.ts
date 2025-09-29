import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, DataBounds,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { Virtual } from './virtual';

import { use, yeet, memo, useCallback, useOne, useNoCallback } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, getBundleKey } from '@use-gpu/shader/wgsl';
import { makeShaderBindings, resolve } from '@use-gpu/core';

import { makeArrowGeometry } from './geometry/arrow';
import { RawData } from '../data/raw-data';
import { useRawSource } from '../hooks/useRawSource';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';
import { useDataLength } from '../hooks/useDataBinding';
import { usePickingShader } from '../providers/picking-provider';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getArrowVertex } from '@use-gpu/wgsl/instance/vertex/arrow.wgsl';
import { getPassThruColor } from '@use-gpu/wgsl/mask/passthru.wgsl';

export type RawArrowsProps = {
  anchor?: number[] | TypedArray,
  position?: number[] | TypedArray,
  color?: number[] | TypedArray,
  size?: number,
  width?: number,
  depth?: number,
  zBias?: number,

  anchors?:   ShaderSource,
  positions?: ShaderSource,
  colors?:    ShaderSource,
  sizes?:     ShaderSource,
  widths?:    ShaderSource,
  depths?:    ShaderSource,
  zBiases?:   ShaderSource,

  lookups?: ShaderSource,
  ids?:     ShaderSource,
  lookup?:  number,
  id?:      number,

  detail?: number,

  count?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

const ZERO = [0, 0, 0, 1];

export const RawArrows: LiveComponent<RawArrowsProps> = memo((props: RawArrowsProps) => {
  const {
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
    mode = 'opaque',
    detail = 12,
    count = null,
    id = 0,
  } = props;
  
  const det = Math.max(4, detail);
  const geometry = useOne(() => makeArrowGeometry(det), det);

  // Set up draw
  const vertexCount = geometry.count;
  const instanceCount = useDataLength(count, props.anchors);

  const a = useShaderRef(props.anchor, props.anchors);
  const p = useShaderRef(props.position, props.positions);
  const c = useShaderRef(props.color, props.colors);
  const e = useShaderRef(props.size, props.sizes);
  const w = useShaderRef(props.width, props.widths);
  const d = useShaderRef(props.depth, props.depths);
  const z = useShaderRef(props.zBias, props.zBiases);

  const l = useShaderRef(null, props.lookups);
  
  const g = useRawSource(geometry.attributes.positions, 'vec4<f32>');

  const [xf, scissor, getBounds] = useApplyTransform(p);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds && (props.positions as any)?.bounds) {
    bounds = useCallback(() => getBounds((props.positions! as any).bounds), [props.positions, getBounds]);
  }
  else {
    useNoCallback();
  }

  const getVertex = useBoundShader(getArrowVertex, [g, a, xf, scissor, c, e, w, d, z, l]);
  const getPicking = usePickingShader(props);
  const getFragment = getPassThruColor;

  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const [pipeline, defines] = usePipelineOptions({
    mode,
    topology: 'triangle-list',
    side: 'both',
    scissor,
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
  });

  return (
     use(Virtual, {
      vertexCount,
      instanceCount,
      bounds,

      links,
      defines,

      renderer: 'solid',
      pipeline,
      mode,
    })
  );
}, 'RawArrows');


