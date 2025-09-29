import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { PipelineOptions } from '../hooks/usePipelineOptions';

import { RawFaces } from '../primitives/raw-faces';

import { patch } from '@use-gpu/state';
import { use, memo, useMemo, useOne } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { resolve } from '@use-gpu/core';

import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundSource } from '../hooks/useBoundSource';
import { useBoundShader } from '../hooks/useBoundShader';
import { useApplyTransform } from '../hooks/useApplyTransform';

import { getSurfaceIndex, getSurfaceNormal, getSurfaceUV } from '@use-gpu/wgsl/plot/surface.wgsl';

export type SurfaceLayerProps = {
  position?: number[] | TypedArray,
  color?: number[] | TypedArray,
  st?: number[] | TypedArray,

  positions?: ShaderSource,
  colors?: ShaderSource,
  sts?: ShaderSource,

  loopX?: boolean,
  loopY?: boolean,
  shaded?: boolean,

  size?: Lazy<[number, number] | [number, number, number] | [number, number, number, number]>,
  side?: 'front' | 'back' | 'both',
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'shadow' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

const [SIZE_BINDING] = bundleToAttributes(getSurfaceIndex);

/** Draws 2D surfaces across the X and Y data dimension. */
export const SurfaceLayer: LiveComponent<SurfaceLayerProps> = memo((props: SurfaceLayerProps) => {
  const {
    position,
    positions,
    color,
    colors,
    st,
    sts,

    loopX = false,
    loopY = false,
    shaded = true,
    side = 'both',

    size,
    mode = 'opaque',
    id = 0,
    ...rest
  } = props;

  const sizeExpr = useMemo(() => () =>
    (props.positions as any)?.size ?? resolve(size),
    [props.positions, size]);
  const boundSize = useBoundSource(SIZE_BINDING, sizeExpr);

  const countExpr = useOne(() => () => {
    const s = resolve(sizeExpr);
    return ((s[0] || 1) - +!loopX) * ((s[1] || 1) - +!loopY) * (s[2] || 1) * (s[3] || 1) * 2;
  }, sizeExpr);

  const defines = useMemo(() => ({LOOP_X: !!loopX, LOOP_Y: !!loopY}), [loopX, loopY]);
  const indices = useBoundShader(getSurfaceIndex, [boundSize], defines);

  const p = useShaderRef(props.position, props.positions);
  const normals = useBoundShader(getSurfaceNormal, [boundSize, p], defines);

  const uvs = useBoundShader(getSurfaceUV, [boundSize]);

  return use(RawFaces, {
    position,
    positions,
    color,
    colors,
    st,

    indices,
    normals,
    uvs,
    sts,

    shaded,
    side,
    count: countExpr,
    mode,
    id,
    ...rest,
  });
}, 'SurfaceLayer');
