import type { LiveComponent } from '../../live';
import type { VectorLike, Lazy, UniformAttribute, DataBounds } from '../../core';
import type { ShaderSource } from '../../shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useCallback, useMemo, useNoCallback } from '../../live';
import { chainTo } from '../../shader/wgsl';

import { FacetSource, useFacetShader } from './hooks/facets';
import { PickingSource, usePickingShader } from './hooks/picking';

import { useMaterialContext } from '../providers/material-provider';
import { TransformContextProps } from '../providers/transform-provider';

import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useShader, useNoShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';
import { useDataLength } from '../hooks/useDataBinding';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getQuadVertex, getQuadVertexShaded } from '../../wgsl/instance/vertex/quad.wgsl';
import { getMaskedColor, getMaskedSurface } from '../../wgsl/mask/masked.wgsl';
import { solidToShaded } from '../../wgsl/instance/surface/solid-to-shaded.wgsl';
import { getRaytraceSurface } from '../../wgsl/instance/surface/raytrace-surface.wgsl';

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };

export type RawQuadsFlags = {
  shaded?: boolean,
  join?: 'tangent' | 'miter' | 'round' | 'bevel',
} & Pick<Partial<PipelineOptions>, 'mode' | 'shadow' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'alphaToDiscard' | 'blend'>;

export type RawQuadsProps = {
  position?: VectorLike,
  rectangle?: VectorLike,
  color?: VectorLike,
  depth?: number,
  zBias?: number,
  uv?: VectorLike,
  st?: VectorLike,

  positions?: ShaderSource,
  rectangles?: ShaderSource,
  colors?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,

  mask?: ShaderSource,
  raytrace?: ShaderSource,

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps,

  count?: Lazy<number>,
} & FacetSource & PickingSource & RawQuadsFlags;

export const RawQuads: LiveComponent<RawQuadsProps> = memo((props: RawQuadsProps) => {
  const {
    alphaToCoverage,
    alphaToDiscard,
    depthTest,
    depthWrite,
    blend,
    mode = 'opaque',

    instance,
    instances,
    transform,

    count = null,
    shaded = false,
    shadow = false,
  } = props;

  const vertexCount = 4;
  const instanceCount = useDataLength(count, props.positions);

  const p = useSource(POSITIONS, useShaderRef(props.position, props.positions));
  const r = useShaderRef(props.rectangle, props.rectangles);
  const c = useShaderRef(props.color, props.colors);
  const d = useShaderRef(props.depth, props.depths);
  const z = useShaderRef(props.zBias, props.zBiases);
  const u = useShaderRef(props.uv, props.uvs);
  const s = useShaderRef(props.st, props.sts ?? p);

  const m = (mode !== 'debug') ? props.mask : null;
  const rt = (mode !== 'debug') ? props.raytrace : null;

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

  const boundVertex = useShader(shaded ? getQuadVertexShaded : getQuadVertex, [
    positions, scissor,
    r,
    c, d, z, u, s,
    instanceCount,
  ]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(boundVertex, instance, instances, instanceCount);
  const getPicking = usePickingShader(props);
  const getFacet = useFacetShader(props);

  // Shape mask (2D)
  const applyFragmentMask = m && material.getFragment ? useShader(getMaskedColor, [m]) : useNoShader();
  const applySurfaceMask = m && material.getSurface ? useShader(getMaskedSurface, [m]) : useNoShader();

  // Depth/normal mask via raytrace (3D)
  const getSurfaceRT = (
    rt && material.getSurface ? useShader(getRaytraceSurface, [material.getSurface, rt]) : useNoShader()
  );

  const links = useMemo(() => ({
    getVertex: shadow && !shaded ? chainTo(getVertex, solidToShaded) : getVertex,
    getPicking,
    getFacet,
    ...material,
    getSurface: getSurfaceRT ?? (material.getSurface && applySurfaceMask ? chainTo(applySurfaceMask, material.getSurface) : material.getSurface),
    getFragment: material.getFragment && applyFragmentMask ? chainTo(applyFragmentMask, material.getFragment) : material.getFragment,
  }), [getVertex, getPicking, getFacet, getSurfaceRT, applyFragmentMask, applySurfaceMask, shadow, shaded, material]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    shadow,
    alphaToCoverage,
    alphaToDiscard,
    depthTest,
    depthWrite,
    blend,
  });

  const defines: Record<string, any> = useMemo(() => ({
    ...defs,
    ...instanceDefs,
    HAS_DEPTH: shaded,
    HAS_EDGE_BLEED: true,
  }), [defs, instanceDefs, shaded]);

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
}, 'RawQuads');
