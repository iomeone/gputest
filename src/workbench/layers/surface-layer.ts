import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike, Lazy } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { PipelineOptions } from '../hooks/usePipelineOptions';

import { RawFaces } from '../primitives/raw-faces';

import { use, memo, useMemo, useOne } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { resolve } from '@use-gpu/core';

import { useShaderRef } from '../hooks/useShaderRef';
import { useSource } from '../hooks/useSource';
import { useShader } from '../hooks/useShader';

import { getSurfaceIndex, getSurfaceUV } from '@use-gpu/wgsl/plot/surface.wgsl';
import { getSurfaceNormal } from '@use-gpu/wgsl/plot/surface-normal.wgsl';

export type SurfaceLayerProps = {
  position?: VectorLike,
  color?: VectorLike,
  uv?: VectorLike,
  st?: VectorLike,
  zBias?: VectorLike,

  positions?: ShaderSource,
  colors?: ShaderSource,
  sts?: ShaderSource,
  zBiases?: ShaderSource,

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
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    position,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    positions,
    color,
    colors,
    st,
    sts,
    zBias,
    zBiases,

    loopX = false,
    loopY = false,
    shaded = true,
    side = 'both',

    size,
    mode = 'opaque',
    ...rest
  } = props;

  const sizeExpr = useMemo(() => () =>
    resolve(size) ?? (props.positions as any)?.size,
    [props.positions, size]);
  const boundSize = useSource(SIZE_BINDING, sizeExpr);

  const countExpr = useOne(() => () => {
    const s = resolve(sizeExpr);
    return ((s[0] || 1) - +!loopX) * ((s[1] || 1) - +!loopY) * (s[2] || 1) * (s[3] || 1) * 2 * 3;
  }, sizeExpr);

  const defines = useMemo(() => ({LOOP_X: !!loopX, LOOP_Y: !!loopY}), [loopX, loopY]);
  const indices = useShader(getSurfaceIndex, [boundSize], defines);

  const p = useShaderRef(props.position, props.positions);
  const ps = useSource({format: 'vec4<f32>', name: 'positions'}, p);

  const normals = useShader(getSurfaceNormal, [boundSize, ps]);

  const uvs = useShader(getSurfaceUV, [boundSize]);

  return use(RawFaces, {
    positions: ps,
    color,
    colors,
    st,

    indices,
    normals,
    uvs,
    sts,

    zBias,
    zBiases,

    shaded,
    side,
    count: countExpr,
    mode,
    ...rest,
  });
}, 'SurfaceLayer');
