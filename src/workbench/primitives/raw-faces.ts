import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { ViewContext } from '../providers/view-provider';
import { Virtual } from './virtual';

import { patch } from '@use-gpu/state';
import { use, yeet, memo, useCallback, useMemo, useOne } from '@use-gpu/live';
import { bundleToAttribute, bundleToAttributes } from '@use-gpu/shader/wgsl';
import { resolve, makeShaderBindings } from '@use-gpu/core';
import { useMaterialContext } from '../providers/material-provider';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader, useNoBoundShader } from '../hooks/useBoundShader';

import { getFaceVertex } from '@use-gpu/wgsl/instance/vertex/face.wgsl';
import { getPassThruFragment } from '@use-gpu/wgsl/mask/passthru.wgsl';

export type RawFacesProps = {
  position?: number[] | TypedArray,
  normal?: number[] | TypedArray,
  tangent?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  st?: number[] | TypedArray,
  segment?: number,
  color?: number[] | TypedArray,

  positions?: ShaderSource,
  normals?: ShaderSource,
  tangents?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  segments?: ShaderSource,
  colors?: ShaderSource,

  indices?: ShaderSource,
  lookups?: ShaderSource,

  unweldedNormals?: boolean,
  unweldedTangents?: boolean,

  shaded?: boolean,
  count?: Lazy<number>,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const ZERO = [0, 0, 0, 1];

const VERTEX_BINDINGS = bundleToAttributes(getFaceVertex);

const PIPELINE = {
  primitive: {
    topology: 'triangle-list',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const RawFaces: LiveComponent<RawFacesProps> = memo((props: RawFacesProps) => {
  const {
    pipeline: propPipeline,
    shaded = false,
    count = 1,
    mode = 'opaque',
    id = 0,

    unweldedNormals = false,
    unweldedTangents = false,
  } = props;

  // Set up draw as:
  // - pre-indexed triangles
  // - segmented triangle fans (convex faces)
  // - individual tris
  const vertexCount = 3;
  const instanceCount = useCallback(() => {
    const indices = (props.indices as any)?.length;
    const segments = (props.segments as any)?.length;
    const positions = (props.positions as any)?.length;

    if (indices != null) return indices / 3;
    if (segments != null) return segments - 2;
    if (positions != null && !props.indices) return positions / 3;

    const c = resolve(count) || 0;
    return (props.segments != null) ? c - 2 : c;
  }, [props.positions, props.segments, count]);

  const pipeline = useOne(() => patch(PIPELINE, propPipeline), propPipeline);

  const p = useShaderRef(props.position, props.positions);
  const n = useShaderRef(props.normal, props.normals);
  const t = useShaderRef(props.tangent, props.tangents);
  const u = useShaderRef(props.uv, props.uvs);
  const s = useShaderRef(props.st, props.sts);
  const g = useShaderRef(props.segment, props.segments);
  const c = useShaderRef(props.color, props.colors);

  const i = useShaderRef(null, props.indices);
  const l = useShaderRef(null, props.lookups);

  const xf = useApplyTransform(p);
  const m = useMaterialContext();

  const hasIndices = !!props.indices;
  const defines = useMemo(() => ({
    HAS_INDICES: hasIndices,
    UNWELDED_NORMALS: !!unweldedNormals,
    UNWELDED_TANGENTS: !!unweldedTangents,
  }), [hasIndices, unweldedNormals, unweldedTangents]);

  const getVertex = useBoundShader(getFaceVertex, VERTEX_BINDINGS, [xf, n, t, u, s, g, c, i, l]);
  const getFragment = shaded ? m : getPassThruFragment;

  return (
    use(Virtual, {
      vertexCount,
      instanceCount,

      getVertex,
      getFragment,

      defines,

      renderer: shaded ? 'shaded' : 'solid',

      pipeline,
      mode,
      id,
    })
  );
}, 'RawFaces');
