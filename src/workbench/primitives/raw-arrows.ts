import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike, Lazy, UniformAttribute, DataBounds } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useCallback, useOne, useMemo, useNoCallback } from '@use-gpu/live';
import { getBundleKey } from '@use-gpu/shader/wgsl';

import { PickingSource, usePickingShader } from '../providers/picking-provider';
import { TransformContextProps } from '../providers/transform-provider';

import { useRawSource } from '../hooks/useRawSource';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';
import { useDataLength } from '../hooks/useDataBinding';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { makeArrowFlatGeometry } from './geometry/arrow-flat';
import { makeArrowGeometry } from './geometry/arrow';

import { getAnchorIndex } from '@use-gpu/wgsl/instance/index/anchor.wgsl';
import { getArrowVertex } from '@use-gpu/wgsl/instance/vertex/arrow.wgsl';
import { getPassThruColor } from '@use-gpu/wgsl/mask/passthru.wgsl';

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };

export type RawArrowsFlags = {
  flat?: boolean,
  detail?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'alphaToCoverage' | 'depthTest' | 'depthWrite' | 'blend'>;

export type RawArrowsProps = {
  anchor?: VectorLike,
  position?: VectorLike,
  uv?: VectorLike,
  st?: VectorLike,
  color?: VectorLike,
  size?: number,
  width?: number,
  depth?: number,
  zBias?: number,

  anchors?:   ShaderSource,
  positions?: ShaderSource,
  uvs?:       ShaderSource,
  sts?:       ShaderSource,
  colors?:    ShaderSource,
  sizes?:     ShaderSource,
  widths?:    ShaderSource,
  depths?:    ShaderSource,
  zBiases?:   ShaderSource,

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps | ShaderModule,

  count?: number,
} & PickingSource & RawArrowsFlags;

export const RawArrows: LiveComponent<RawArrowsProps> = memo((props: RawArrowsProps) => {
  const {
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
    mode = 'opaque',

    instance,
    instances,
    transform,

    flat = false,
    detail = 12,
    count = null,
  } = props;

  const det = Math.max(4, detail);
  const geometry = useMemo(() => flat ? makeArrowFlatGeometry() : makeArrowGeometry(det), [flat, det]);

  // Set up draw
  const vertexCount = geometry.count;
  const anchorCount = useDataLength(count, props.anchors);
  const positionCount = useDataLength(count, props.positions);

  const p = useSource(POSITIONS, useShaderRef(props.position, props.positions));
  const a = useShaderRef(props.anchor, props.anchors);
  const u = useShaderRef(props.uv, props.uvs);
  const s = useShaderRef(props.st, props.sts ?? p);
  const c = useShaderRef(props.color, props.colors);
  const e = useShaderRef(props.size, props.sizes);
  const w = useShaderRef(props.width, props.widths);
  const d = useShaderRef(props.depth, props.depths);
  const z = useShaderRef(props.zBias, props.zBiases);

  const g = useRawSource(geometry.attributes.positions, 'vec4<f32>');

  const {positions, scissor, bounds: getBounds} = useApplyTransform(p, transform);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds && (props.positions as any)?.bounds) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bounds = useCallback(() => getBounds((props.positions! as any).bounds), [props.positions, getBounds]);
  }
  else {
    useNoCallback();
  }

  const boundVertex = useShader(getArrowVertex, [
    g, a, positions, scissor,
    u, s,
    c, e, w, d, z,
    positionCount
  ]);
  const anchorIndex = useShader(getAnchorIndex, [a]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(boundVertex, instance, instances, anchorCount, anchorIndex);
  const getPicking = usePickingShader(props);
  const getFragment = getPassThruColor;

  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-list',
    side: 'both',
    scissor,
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
  });

  const defines = useMemo(() => ({
    ...defs,
    ...instanceDefs,
    FLAT_ARROWS: flat,
  }), [defs, instanceDefs, flat]);

  return (
     useDraw({
      vertexCount,
      instanceCount: totalCount,
      bounds,

      links,
      defines,

      renderer: 'solid',
      pipeline,
      mode,
    })
  );
}, 'RawArrows');


