import type { LiveComponent } from '../../live';
import type { VectorLike, Lazy, UniformAttribute, DataBounds } from '../../core';
import type { ShaderModule, ShaderSource } from '../../shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useCallback, useMemo, useOne, useNoCallback } from '../../live';
import { chainTo } from '../../shader/wgsl';

import { FacetSource, useFacetShader } from './hooks/facets';
import { PickingSource, usePickingShader } from './hooks/picking';

import { useMaterialContext } from '../providers/material-provider';
import { TransformContextProps } from '../providers/transform-provider';

import { useApplyTransform } from '../hooks/useApplyTransform';
import { getShader, useShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';
import { useDataLength } from '../hooks/useDataBinding';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';
import { useShaderRef } from '../hooks/useShaderRef';

import { getLineSegment } from '../../wgsl/geometry/segmentwgsl';
import { getLineVertex, getLineShadedVertex } from '../../wgsl/instance/vertex/linewgsl';
import { solidToShaded } from '../../wgsl/instance/surface/solid-to-shadedwgsl';

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };

export type RawLinesFlags = {
  sides?: number,
  shaded?: boolean,
  join?: 'tangent' | 'miter' | 'round' | 'bevel',
} & Pick<Partial<PipelineOptions>, 'mode' | 'shadow' | 'alphaToCoverage' | 'alphaToDiscard' | 'depthTest' | 'depthWrite' | 'blend'>;

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
} & FacetSource & PickingSource & RawLinesFlags;

const LINE_JOIN_SIZE = {
  'tangent': 0,
  'bevel': 1,
  'miter': 2,
  'round': 4,
} as Record<string, number>;

const LINE_JOIN_STYLE = {
  'tangent': 0,
  'bevel': 1,
  'miter': 2,
  'round': 3,
} as Record<string, number>;

export const RawLines: LiveComponent<RawLinesProps> = memo((props: RawLinesProps) => {
  const {
    mode = 'opaque',
    alphaToCoverage,
    alphaToDiscard,
    depthTest,
    depthWrite,
    blend,

    instance,
    instances,
    transform,

    count = null,
    shaded = false,
    shadow = false,

    sides = 2,
    join,
    depth,
  } = props;

  if (typeof depth === 'number' && depth >= 0 && shadow) console.warn("Shadow-casting lines must have absolute sizing (depth = -1)");

  // Customize line shader
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const j = (join! in LINE_JOIN_SIZE) ? join! : 'bevel';

  const style = LINE_JOIN_STYLE[j];
  const segments = LINE_JOIN_SIZE[j];
  const quads = (1 + segments);

  // Set up draw
  const vertexCount = (shaded && sides > 0) ? quads * (2 * (3 + sides)) : 2 * (1 + quads);
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

  // Solid or shaded material
  const renderer = shadow || shaded ? 'shaded' : 'solid';
  const material = useMaterialContext()[renderer];

  const boundVertex = useShader(shaded ? getLineShadedVertex : getLineVertex, [
    positions, scissor,
    u, s,
    g ?? auto, c, w, d, z,
    t, e,
    instanceCount,
  ]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(boundVertex, instance, instances, instanceCount);
  const getPicking = usePickingShader(props);
  const getFacet = useFacetShader(props);

  const links = useMemo(() => ({
    getVertex: shadow && !shaded ? chainTo(getVertex, solidToShaded) : getVertex,
    getPicking,
    getFacet,
    ...material,
  }), [getVertex, getPicking, getFacet, shadow, shaded, material]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    shadow,
    scissor,
    alphaToCoverage,
    alphaToDiscard,
    depthTest,
    depthWrite,
    blend,
  });

  const defines = useMemo(() => ({
    ...defs,
    ...instanceDefs,
    HAS_LINE_SHADING: !!shaded,
    LINE_STRIP_DETAIL: shaded ? sides : 0,
    LINE_JOIN_STYLE: style,
    LINE_JOIN_SIZE: segments,
  }), [defs, instanceDefs, shaded, sides, style, segments]);

  return useDraw({
    vertexCount,
    instanceCount: totalCount,
    bounds,

    links,
    defines,

    renderer,
    pipeline,
    mode,
  });
}, 'RawLines');
