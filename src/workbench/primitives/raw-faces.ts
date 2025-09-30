import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike, Lazy, UniformAttribute, DataBounds, GPUGeometry } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useCallback, useMemo, useNoCallback } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';

import { useMaterialContext } from '../providers/material-provider';
import { PickingSource, usePickingShader } from '../providers/picking-provider';
import { useScissorContext } from '../providers/scissor-provider';
import { TransformContextProps } from '../providers/transform-provider';

import { useShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';
import { useCombinedTransform, useNoCombinedTransform } from '../hooks/useCombinedTransform';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';
import { useShaderRef } from '../hooks/useShaderRef';

import { getFaceVertex } from '@use-gpu/wgsl/instance/vertex/face.wgsl';
import { getInstancedFaceIndex } from '@use-gpu/wgsl/instance/index/face.wgsl';

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };

export type RawFacesFlags = {
  flat?: boolean,
  shaded?: boolean,
  fragDepth?: boolean,
} & Pick<Partial<PipelineOptions>, 'mode' | 'side' | 'shadow' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>

export type RawFacesProps = {
  position?: VectorLike,
  normal?: VectorLike,
  tangent?: VectorLike,
  segment?: number,
  uv?: VectorLike,
  st?: VectorLike,
  color?: VectorLike,
  zBias?: number,

  positions?: ShaderSource,
  normals?: ShaderSource,
  tangents?: ShaderSource,
  segments?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  colors?: ShaderSource,
  zBiases?: ShaderSource,

  indices?: ShaderSource,
  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps,

  unwelded?: {
    colors?: boolean,
    normals?: boolean,
    tangents?: boolean,
    uvs?: boolean,
    lookups?: boolean,
  },

  mesh?: GPUGeometry,
  count?: Lazy<number>,

  shouldDispatch?: (u: Record<string, any>) => boolean | number | null | undefined,
  onDispatch?: (u: Record<string, any>) => void,
} & PickingSource & RawFacesFlags;

export const RawFaces: LiveComponent<RawFacesProps> = memo((props: RawFacesProps) => {
  const {
    flat = false,
    shaded = false,
    shadow = true,
    count = null,

    mode = 'opaque',
    side = 'front',
    alphaToCoverage,
    fragDepth = false,
    depthTest,
    depthWrite,
    blend,

    transform,

    mesh,
    unwelded = mesh?.unwelded,

    shouldDispatch,
    onDispatch,
  } = props;

  const attr = mesh ? {...props, ...mesh.attributes} : props;

  // Set up draw as:
  // - individual tris (none)
  // - segmented triangle fans (convex faces) (segments)
  // - pre-indexed triangles (indices)
  // - pre-indexed segmented triangle fans (indices + segments)
  const vertexCount = 3;
  const instanceCount = useCallback(() => {
    if (count != null) {
      const c = (resolve(count) || 0);
      return (attr.segments != null) ? Math.max(0, c - 2) : (c / 3) | 0;
    }

    const segments = (attr.segments as any)?.length;
    const indices = (attr.indices as any)?.length;
    const positions = (attr.positions as any)?.length;

    if (segments != null) return segments - 2;
    if (indices != null) return indices / 3;
    if (positions != null && !attr.indices) return positions / 3;

    return 0;
  }, [attr.positions, attr.indices, attr.segments, count]);

  const p = useSource(POSITIONS, useShaderRef(attr.position, attr.positions));
  const n = useShaderRef(attr.normal, attr.normals);
  const t = useShaderRef(attr.tangent, attr.tangents);
  const u = useShaderRef(attr.uv, attr.uvs);
  const s = useShaderRef(attr.st, attr.sts ?? p);
  const g = useShaderRef(attr.segment, attr.segments);
  const c = useShaderRef(attr.color, attr.colors);
  const z = useShaderRef(attr.zBias, attr.zBiases);

  const i = useShaderRef(null, attr.indices);

  const {transform: xf, differential: xd, bounds: getBounds} = transform ? (useNoCombinedTransform(), transform) : useCombinedTransform();
  const scissor = useScissorContext();

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds && (attr.positions as any)?.bounds) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bounds = useCallback(() => getBounds((attr.positions! as any).bounds), [attr.positions, getBounds]);
  }
  else {
    useNoCallback();
  }

  const renderer = shaded ? 'shaded' : 'solid';
  const material = useMaterialContext()[renderer];
  const boundVertex = useShader(getFaceVertex, [
    xf, xd, scissor,
    p, n, t, u, s, g, c, z,
    i,
  ]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(
    boundVertex,
    attr.instance,
    attr.instances,
    instanceCount,
    !props.segments ? getInstancedFaceIndex : undefined,
  );
  const getPicking = usePickingShader(attr);

  const links = useMemo(() => {
    return shaded
    ? {
      getVertex,
      getPicking,
      ...material,
    } : {
      getVertex,
      getPicking,
      ...material,
    }
  }, [getVertex, getPicking, material]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-list',
    side,
    shadow,
    scissor,
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
  });

  const hasIndices = !!attr.indices;
  const hasSegments = !!attr.segments;
  const defines = useMemo(() => ({
    ...defs,
    ...instanceDefs,
    HAS_DEPTH: fragDepth,
    HAS_INDICES: hasIndices,
    HAS_SEGMENTS: hasSegments,
    FLAT_NORMALS: flat,
    UNWELDED_COLORS: !!unwelded?.colors,
    UNWELDED_NORMALS: !!unwelded?.normals,
    UNWELDED_TANGENTS: !!unwelded?.tangents,
    UNWELDED_UVS: !!unwelded?.uvs,
    UNWELDED_LOOKUPS: !!unwelded?.lookups,
  }), [defs, flat, fragDepth, instanceDefs, hasSegments, unwelded]);

  return (
    useDraw({
      vertexCount,
      instanceCount: totalCount,
      bounds,

      links,
      defines,
      renderer,

      pipeline,
      mode,

      shouldDispatch,
      onDispatch,
    })
  );
}, 'RawFaces');
