import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike, Lazy, UniformAttribute, DataBounds } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useCallback, useMemo, useOne, useNoCallback } from '@use-gpu/live';

import { useMaterialContext } from '../providers/material-provider';
import { PickingSource, usePickingShader } from '../providers/picking-provider';
import { TransformContextProps } from '../providers/transform-provider';

import { useApplyTransform } from '../hooks/useApplyTransform';
import { getShader, useShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';
import { useDataLength } from '../hooks/useDataBinding';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';
import { useShaderRef } from '../hooks/useShaderRef';

import { getLineSegment } from '@use-gpu/wgsl/geometry/segment.wgsl';
import { getLineVertex } from '@use-gpu/wgsl/instance/vertex/line.wgsl';

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };

export type RawLinesFlags = {
  join?: 'miter' | 'round' | 'bevel',
} & Pick<Partial<PipelineOptions>, 'mode' | 'alphaToCoverage' | 'depthTest' | 'depthWrite' | 'blend'>;

export type RawLinesProps = {
  position?: VectorLike,
  segment?: number,
  uv?: VectorLike,
  st?: VectorLike,
  color?: VectorLike,
  width?: number,
  depth?: number,
  zBias?: number,
  trim?: VectorLike,
  size?: number,

  positions?: ShaderSource,

  segments?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  colors?: ShaderSource,
  widths?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,
  trims?: ShaderSource,
  sizes?: ShaderSource,

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps | ShaderModule,

  count?: Lazy<number>,
} & PickingSource & RawLinesFlags;

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

export const RawLines: LiveComponent<RawLinesProps> = memo((props: RawLinesProps) => {
  const {
    mode = 'opaque',
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,

    instance,
    instances,
    transform,

    count = null,
    join,
  } = props;

  // Customize line shader
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const j = (join! in LINE_JOIN_SIZE) ? join! : 'bevel';

  const style = LINE_JOIN_STYLE[j];
  const segments = LINE_JOIN_SIZE[j];
  const tris = (1+segments) * 2;

  // Set up draw
  const vertexCount = 2 + tris;
  const instanceCount = useDataLength(count, props.positions, -1);

  // Instanced draw (repeated or random access)
  const p = useSource(POSITIONS, useShaderRef(props.position, props.positions));
  const u = useShaderRef(props.uv, props.uvs);
  const s = useShaderRef(props.st, props.sts ?? p);
  const g = useShaderRef(null, props.segments);
  const c = useShaderRef(props.color, props.colors);
  const w = useShaderRef(props.width, props.widths);
  const d = useShaderRef(props.depth, props.depths);
  const z = useShaderRef(props.zBias, props.zBiases);
  const t = useShaderRef(props.trim, props.trims);
  const e = useShaderRef(props.size, props.sizes);

  const auto = useOne(() => props.segment != null ? getShader(getLineSegment, [props.segment]) : null, props.segment);

  const {positions, scissor, bounds: getBounds} = useApplyTransform(p, transform);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds && (props.positions as any)?.bounds) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bounds = useCallback(() => getBounds((props.positions! as any).bounds), [props.positions, getBounds]);
  }
  else {
    useNoCallback();
  }

  const material = useMaterialContext().solid;

  const boundVertex = useShader(getLineVertex, [
    positions, scissor,
    u, s,
    g ?? auto, c, w, d, z,
    t, e,
    instanceCount,
  ]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(boundVertex, instance, instances, instanceCount);
  const getPicking = usePickingShader(props);

  const links = useMemo(() => ({
    getVertex,
    getPicking,
    ...material,
  }), [getVertex, getPicking, material]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
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
    LINE_JOIN_STYLE: style,
    LINE_JOIN_SIZE: segments,
  }), [defs, instanceDefs, style, segments]);

  return useDraw({
    vertexCount,
    instanceCount: totalCount,
    bounds,

    links,
    defines,

    renderer: 'solid',
    pipeline,
    mode,
  });
}, 'RawLines');
