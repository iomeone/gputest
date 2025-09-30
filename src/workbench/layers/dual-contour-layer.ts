import type { LiveComponent } from '@use-gpu/live';
import type { Lazy, StorageSource, DataBounds } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { VectorLike } from '@use-gpu/core';

import { use, memo, useCallback, useMemo, useOne, useRef, useVersion, useNoCallback, incrementVersion } from '@use-gpu/live';
import { resolve, uploadBuffer, toDataBounds } from '@use-gpu/core';
import { shouldEqual, sameShallow } from '@use-gpu/traits/live';

import { useShader } from '../hooks/useShader';
import { useCombinedTransform, useNoCombinedTransform } from '../hooks/useCombinedTransform';
import { useDataSize } from '../hooks/useDataBinding';
import { useDerivedSource } from '../hooks/useDerivedSource';
import { useRawSource } from '../hooks/useRawSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { useShaderRef } from '../hooks/useShaderRef';
import { useDraw } from '../hooks/useDraw';

import { useDeviceContext } from '../providers/device-provider';
import { useMaterialContext } from '../providers/material-provider';
import { TransformContextProps } from '../providers/transform-provider';
import { PassReconciler } from '../reconcilers/index';

import { main as scanVolume } from '@use-gpu/wgsl/contour/scan.wgsl';
import { main as fitContourLinear } from '@use-gpu/wgsl/contour/fit-linear.wgsl';
import { main as fitContourQuadratic } from '@use-gpu/wgsl/contour/fit-quadratic.wgsl';
import { getDualContourVertex } from '@use-gpu/wgsl/instance/vertex/dual-contour.wgsl';
import { getPassThruColor } from '@use-gpu/wgsl/mask/passthru.wgsl';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { Dispatch } from '../queue/dispatch';

const {quote} = PassReconciler;

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';

const READ_WRITE_SOURCE_VOLATILE = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, volatile: true } : {};
const INDIRECT_SOURCE   = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_SRC } : {};

const INDIRECT_OFFSET_1 = { byteOffset: 16 };
const READ_ONLY_SOURCE = { readWrite: false };

export type DualContourLayerFlags = Pick<Partial<PipelineOptions>, 'mode' | 'side' | 'shadow' | 'alphaToCoverage' | 'blend'>

export type DualContourLayerProps = {
  values: ShaderSource,
  normals?: ShaderSource,
  level?: number,
  padding?: number,

  range: VectorLike[],
  color?: VectorLike,
  zBias?: number,

  method?: string,
  /*
  loopX?: boolean,
  loopY?: boolean,
  loopZ?: boolean,
  */
  shaded?: boolean,
  shadow?: boolean,
  live?: boolean,

  transform?: TransformContextProps,

  size?: Lazy<[number, number] | [number, number, number] | [number, number, number, number]>,
  id?: number,
} & DualContourLayerFlags;

export const DualContourLayer: LiveComponent<DualContourLayerProps> = memo((props: DualContourLayerProps) => {
  const {
    color,

    range,
    values,
    normals,
    level,
    padding = 0,
    method = 'linear',

    shaded = false,
    shadow = true,
    zBias = 0,

    /*
    loopX = false,
    loopY = false,
    loopZ = false,
    */
    live = false,

    alphaToCoverage = true,
    side = 'both',
    mode = 'opaque',
    blend,

    transform,
  } = props;

  const size = useDataSize(props.size, props.values);
  const scissor = !!padding;

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

  const {transform: xf, differential: xd, bounds: getBounds} = transform ? (useNoCombinedTransform(), transform) : useCombinedTransform();
  const {shaded: material} = useMaterialContext();

  const rangeBounds = useOne(() => {
    const min = range.map(r => r[0]);
    const max = range.map(r => r[1]);
    return toDataBounds({min, max});
  }, range);

  const rangeBoundsRef = useRef(rangeBounds);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bounds = useCallback(() => getBounds(rangeBoundsRef.current!), [getBounds]);
  }
  else {
    useNoCallback();
  }

  const indirectDraw    = useOne(() => new Uint32Array(12));
  const indirectStorage = useRawSource(indirectDraw, 'u32', INDIRECT_SOURCE);

  const [edgeStorage,   allocateEdges]    = useScratchSource('u32', READ_WRITE_SOURCE_VOLATILE);
  const [cellStorage,   allocateCells]    = useScratchSource('u32', READ_WRITE_SOURCE_VOLATILE);
  const [markStorage,   allocateMarks]    = useScratchSource('u32', READ_WRITE_SOURCE_VOLATILE);
  const [indexStorage,  allocateIndices]  = useScratchSource('u32', READ_WRITE_SOURCE_VOLATILE);
  const [vertexStorage, allocateVertices] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE_VOLATILE);
  const [normalStorage, allocateNormals]  = useScratchSource('vec4<f32>', READ_WRITE_SOURCE_VOLATILE);

  const indirectReadout1 = useDerivedSource(indirectStorage, READ_ONLY_SOURCE);
  const indirectReadout2 = useDerivedSource(indirectStorage, INDIRECT_OFFSET_1);
  const edgeReadout      = useDerivedSource(edgeStorage, READ_ONLY_SOURCE);
  const indexReadout     = useDerivedSource(indexStorage, READ_ONLY_SOURCE);
  const vertexReadout    = useDerivedSource(vertexStorage, READ_ONLY_SOURCE);
  const normalReadout    = useDerivedSource(normalStorage, READ_ONLY_SOURCE);

  const boundScan = useShader(
    scanVolume,
    [
      indirectStorage, edgeStorage, cellStorage, markStorage, indexStorage,
      v, s, l,
    ]);

  const fitContour = method === 'quadratic' ? fitContourQuadratic : fitContourLinear;
  const boundFit = useShader(
    fitContour,
    [
      indirectReadout1, cellStorage, vertexStorage, normalStorage,
      v, n, s, l,
    ]);

  const getVertex = useShader(
    getDualContourVertex,
    [
      edgeReadout, indexReadout, vertexReadout, normalReadout,
      xf, xd, s, p, c, z, min, max,
    ]);

  const sourceVersion = useVersion(values) + useVersion(normals);
  const shouldDispatch = !live ? useCallback(() => (
    sourceVersion +
    ((values as StorageSource).version ?? 0) +
    ((normals as StorageSource)?.version ?? 0)
  ), [sourceVersion, values, normals]) : null;

  const edgePassSize = useCallback(() => {
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

    return [sx - 1, sy - 1, sz - 1];
  }, [size]);

  const device = useDeviceContext();
  const generationRef = useOne(() => ({current: 1}));

  const dispatchEdgePass = useCallback(() => {
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
  }, [device, indirectDraw, indirectStorage]);

  const links = useMemo(() => {
    return shaded
    ? {
      getVertex,
      ...material,
    } : {
      getVertex,
      getFragment: getPassThruColor,
    }
  }, [getVertex, material]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    side,
    shadow,
    scissor,
    alphaToCoverage,
    depthTest: true,
    depthWrite: true,
    blend,
  });

  const defines = useMemo(() => ({
    ...defs,
    IS_QUADRATIC: method === 'quadratic',
  }), [defs, method]);

  const dispatch = useMemo(() => (
    quote([
      use(Dispatch, {
        shader: boundScan,
        size: edgePassSize,
        group: [4, 4, 4],
        shouldDispatch,
        onDispatch: dispatchEdgePass,
      }),
      use(Dispatch, {
        group: [1],
        shader: boundFit,
        indirect: indirectReadout2,
        shouldDispatch,
      }),
    ])
  ), [boundScan, edgePassSize, shouldDispatch, dispatchEdgePass, boundFit, indirectReadout2]);

  const view = [
    dispatch,
    useDraw({
      bounds,
      indirect: indirectStorage,

      links,
      defines,

      pipeline,
      renderer: shaded ? 'shaded' : 'solid',
      mode,
    }),
    /*
    use(Readback, { source: edgeStorage, then: (data) => {
      console.log(data);
      return debug(fragment([]));
    } }),
    */
  ];

  return view;
}, shouldEqual({
  color: sameShallow(),
  range: sameShallow(sameShallow()),
  size: sameShallow(),
}), 'DualContourLayer');
