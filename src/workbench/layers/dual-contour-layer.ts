import type { LiveComponent, Ref } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode, StorageSource, DataBounds,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { VectorLike } from '@use-gpu/traits';

import { Virtual } from '../primitives/virtual';
import { Readback } from '../primitives/readback';

import { patch } from '@use-gpu/state';
import { use, memo, yeet, debug, fragment, useCallback, useMemo, useOne, useRef, useVersion, useNoCallback, incrementVersion } from '@use-gpu/live';
import { resolve, uploadBuffer, toDataBounds } from '@use-gpu/core';

import { useBoundShader, useNoBoundShader } from '../hooks/useBoundShader';
import { useComputePipeline } from '../hooks/useComputePipeline';
import { useDataSize } from '../hooks/useDataBinding';
import { useDerivedSource } from '../hooks/useDerivedSource';
import { useRawSource } from '../hooks/useRawSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { useShaderRef } from '../hooks/useShaderRef';

import { useDeviceContext } from '../providers/device-provider';
import { useMaterialContext } from '../providers/material-provider';
import { useTransformContext } from '../providers/transform-provider';

import { useInspectable } from '../hooks/useInspectable'

import { main as scanVolume } from '@use-gpu/wgsl/contour/scan.wgsl';
import { main as fitContourLinear } from '@use-gpu/wgsl/contour/fit-linear.wgsl';
import { main as fitContourQuadratic } from '@use-gpu/wgsl/contour/fit-quadratic.wgsl';
import { getDualContourVertex } from '@use-gpu/wgsl/instance/vertex/dual-contour.wgsl';
import { getPassThruColor } from '@use-gpu/wgsl/mask/passthru.wgsl';
import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';

import { Dispatch } from '../queue/dispatch';

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';

const READ_WRITE_SOURCE = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC } : {};
const INDIRECT_SOURCE   = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_SRC } : {};

const INDIRECT_OFFSET_1 = { byteOffset: 16 };
const READ_ONLY_SOURCE = { readWrite: false };

export type DualContourLayerProps = {
  color?: number[] | TypedArray,

  range: VectorLike[],
  values: ShaderSource,
  normals?: ShaderSource,
  level?: number,
  padding?: number,
  method?: string,

  loopX?: boolean,
  loopY?: boolean,
  loopZ?: boolean,
  shaded?: boolean,
  zBias?: number,
  live?: boolean,

  size?: Lazy<[number, number] | [number, number, number] | [number, number, number, number]>,
  alphaToCoverage?: boolean,
  side?: 'front' | 'back' | 'both',
  mode?: RenderPassMode | string,
  id?: number,
};

const DEFINES_ALPHA = {
  HAS_ALPHA_TO_COVERAGE: false,
} as Record<string, any>;

const DEFINES_ALPHA_TO_COVERAGE = {
  HAS_ALPHA_TO_COVERAGE: true,
} as Record<string, any>;

const PIPELINE_ALPHA = {
  primitive: {
    topology: 'triangle-strip',
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
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

const PIPELINE = {
  primitive: {
    topology: 'triangle-strip',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;


export const DualContourLayer: LiveComponent<DualContourLayerProps> = memo((props: DualContourLayerProps) => {
  const {
    color,

    range,
    values,
    normals,
    level,
    padding = 0,
    method = 'linear',

    loopX = false,
    loopY = false,
    loopZ = false,
    shaded = true,
    zBias = 0,
    live = false,

    alphaToCoverage = true,
    side = 'both',
    mode = 'opaque',
    id = 0,
  } = props;

  const size = useDataSize(props.size, props.values);

  const v = useShaderRef(null, values);
  const n = useShaderRef(null, normals);
  const s = useShaderRef(size);
  const l = useShaderRef(level);
  const p = useShaderRef(padding);

  const c = useShaderRef(color);
  const z = useShaderRef(zBias);

  const rangeMin = useOne(() => range.map(([min]) => min), range);
  const rangeMax = useOne(() => range.map(([,max]) => max), range);

  const min = useShaderRef(rangeMin);
  const max = useShaderRef(rangeMax);

  const {transform: xf, differential: xd, bounds: getBounds} = useTransformContext();
  const {shaded: material} = useMaterialContext();

  const rangeBounds = useOne(() => {
    const min = range.map(r => r[0]);
    const max = range.map(r => r[1]);
    return toDataBounds([min, max]);
  }, range);

  const rangeBoundsRef = useRef(rangeBounds);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds) {
    bounds = useCallback(() => getBounds(rangeBoundsRef.current!), [getBounds]);
  }
  else {
    useNoCallback();
  }

  const indirectDraw    = useOne(() => new Uint32Array(12));
  const indirectStorage = useRawSource(indirectDraw, 'u32', INDIRECT_SOURCE);

  const [edgeStorage,   allocateEdges]    = useScratchSource('u32', READ_WRITE_SOURCE);
  const [cellStorage,   allocateCells]    = useScratchSource('u32', READ_WRITE_SOURCE);
  const [markStorage,   allocateMarks]    = useScratchSource('u32', READ_WRITE_SOURCE);
  const [indexStorage,  allocateIndices]  = useScratchSource('u32', READ_WRITE_SOURCE);
  const [vertexStorage, allocateVertices] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
  const [normalStorage, allocateNormals]  = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);

  const indirectReadout1 = useDerivedSource(indirectStorage, READ_ONLY_SOURCE);
  const indirectReadout2 = useDerivedSource(indirectStorage, INDIRECT_OFFSET_1);
  const edgeReadout      = useDerivedSource(edgeStorage, READ_ONLY_SOURCE);
  const indexReadout     = useDerivedSource(indexStorage, READ_ONLY_SOURCE);
  const vertexReadout    = useDerivedSource(vertexStorage, READ_ONLY_SOURCE);
  const normalReadout    = useDerivedSource(normalStorage, READ_ONLY_SOURCE);
  
  const boundScan = useBoundShader(
    scanVolume,
    [
      indirectStorage, edgeStorage, cellStorage, markStorage, indexStorage,
      v, s, l,
    ]);

  const fitContour = method === 'quadratic' ? fitContourQuadratic : fitContourLinear;
  const boundFit = useBoundShader(
    fitContour,
    [
      indirectReadout1, cellStorage, vertexStorage, normalStorage,
      v, n, s, l,
    ]);

  const getVertex = useBoundShader(
    getDualContourVertex,
    [
      edgeReadout, indexReadout, vertexReadout, normalReadout,
      xf, xd, s, p, c, z, min, max,
    ]);
  const getScissor = !!padding ? getScissorColor : null;

  const sourceVersion = useVersion(values) + useVersion(normals);
  const shouldDispatch = !live ? () => (
    sourceVersion +
    ((values as StorageSource).version ?? 0) +
    ((normals as StorageSource)?.version ?? 0)
  ) : null;

  const edgePassSize = () => {
    const s = resolve(size);
    const sx = s[0] || 1;
    const sy = s[1] || 1;
    const sz = s[2] || 1;
    
    const d = sx * sy * sz;

    allocateEdges(d * 3);
    allocateCells(d);
    allocateMarks(d);
    allocateIndices(d);
    allocateVertices(d);

    if (method === 'quadratic') allocateNormals(d * 3);
    else allocateNormals(d);

    return [
      Math.ceil((sx - 1) / 4),
      Math.ceil((sy - 1) / 4),
      Math.ceil((sz - 1) / 4),
    ];
  };

  const device = useDeviceContext();
  const generationRef = useOne(() => ({current: 1}));

  const dispatchEdgePass = () => {
    const {current: generation} = generationRef;

    // Build final draw call for geometry
    // -> Make list of active edges (1 edge = 1 final quad)
    indirectDraw[0] = 4; // vertexCount
    indirectDraw[1] = 0; // instanceCount = nextEdge (atomic add)
    // indirectDraw[2] = 0
    // indirectDraw[3] = 0

    // Build vertex dispatch
    // -> Make list of active vertices (adjacent to an active edge)
    // -> Use atomic per-cell mask to handle overlap
    // -> Use generation number to avoid clearing mask
    // -> Make map of cell (i,j,k) to vertex index for reverse lookup
    indirectDraw[4] = 0; // dispatchX = ceil(nextVertex / 64)
    indirectDraw[5] = 1;
    indirectDraw[6] = 1;
    indirectDraw[7] = generation;

    indirectDraw[8] = 0; // nextVertex
    generationRef.current = incrementVersion(generationRef.current);

    uploadBuffer(device, indirectStorage.buffer, indirectDraw.buffer);
  };

  const links = useMemo(() => {
    return shaded
    ? {
      getVertex,
      getScissor,
      ...material,
    } : {
      getVertex,
      getScissor,
      getFragment: getPassThruColor,
    }
  }, [getVertex, getScissor, material]);

  const pipeline = useMemo(() =>
    patch(alphaToCoverage
      ? PIPELINE_ALPHA_TO_COVERAGE
      : PIPELINE_ALPHA,
      { primitive: { cullMode: {
        front: 'back' as GPUCullMode,
        back: 'front' as GPUCullMode,
        both: 'none' as GPUCullMode,
      }[side] } },
    ),
    [alphaToCoverage, side]);

  const defines = useMemo(() => (
    patch(alphaToCoverage ? DEFINES_ALPHA_TO_COVERAGE : DEFINES_ALPHA, {
      HAS_SCISSOR: !!padding,
      IS_QUADRATIC: method === 'quadratic',
    })
  ), [padding, method]);

  const view = [
    use(Dispatch, {
      shader: boundScan,
      size: edgePassSize,
      shouldDispatch,
      onDispatch: dispatchEdgePass,
    }),
    use(Dispatch, {
      shader: boundFit,
      indirect: indirectReadout2,
      shouldDispatch,
    }),
    use(Virtual, {
      bounds,
      indirect: indirectStorage,

      links,
      defines,

      pipeline,
      renderer: shaded ? 'shaded' : 'solid',
      mode,
      id,
    }),
    /*
    use(Readback, { source: edgeStorage, then: (data) => {
      console.log(data);
      return debug(fragment([]));
    } }),
    */
  ];

  return view;
}, 'DualContourLayer');
