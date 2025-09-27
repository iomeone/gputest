import type { LiveComponent } from '../../live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '../../core';
import type { ShaderSource } from '../../shader';

import { RawFaces } from '../primitives/raw-faces';

import { patch } from '../../state';
import { use, memo, useMemo, useOne } from '../../live';
import { bundleToAttributes } from '../../shader/wgsl';
import { resolve } from '../../core';

import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundSource } from '../hooks/useBoundSource';
import { useBoundShader } from '../hooks/useBoundShader';
import { useApplyTransform } from '../hooks/useApplyTransform';

import { getSurfaceIndex, getSurfaceNormal } from '../../gen-wgsl/plot/surface';

export type SurfaceLayerProps = {
  position?: number[] | TypedArray,
  color?: number[] | TypedArray,

  positions?: ShaderSource,
  colors?: ShaderSource,

  loopX?: boolean,
  loopY?: boolean,
  shaded?: boolean,

  size?: Lazy<[number, number] | [number, number, number] | [number, number, number, number]>,
  mode?: RenderPassMode | string,
  id?: number,
};

const [SIZE_BINDING, POSITION_BINDING] = bundleToAttributes(getSurfaceIndex);

/** Draws 2D surfaces across the X and Y data dimension. */
export const SurfaceLayer: LiveComponent<SurfaceLayerProps> = memo((props: SurfaceLayerProps) => {
  const {
    position,
    positions,
    color,
    colors,

    loopX = false,
    loopY = false,
    shaded = true,

    size,
    mode = 'opaque',
    id = 0,
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
  const indices = useBoundShader(getSurfaceIndex, [SIZE_BINDING], [boundSize], defines);

  const p = useShaderRef(props.position, props.positions);
  const xf = useApplyTransform(p);
  const normals = useBoundShader(getSurfaceNormal, [SIZE_BINDING, POSITION_BINDING], [boundSize, xf], defines);

  return use(RawFaces, {
    position,
    positions,
    color,
    colors,

    indices,
    normals,

    shaded,
    count: countExpr,
    mode,
    id,
  });
}, 'SurfaceLayer');
