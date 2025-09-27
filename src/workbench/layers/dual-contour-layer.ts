import type { LiveComponent } from '../../live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '../../core';
import type { ShaderSource } from '../../shader';
import type { VectorLike } from '../../traits';

import { RawFaces } from '../primitives/raw-faces';

import { patch } from '../../state';
import { use, memo, useMemo, useOne } from '../../live';
import { bundleToAttributes } from '../../shader/wgsl';
import { resolve } from '../../core';

import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundSource } from '../hooks/useBoundSource';
import { useBoundShader } from '../hooks/useBoundShader';
import { useApplyTransform } from '../hooks/useApplyTransform';

import { getSurfaceIndex, getSurfaceNormal } from '../../wgsl/plot/surface.wgsl';

/** @hidden */
export type DualContourLayerProps = {
  color?: number[] | TypedArray,

  range: VectorLike[],
  values?: ShaderSource,
  normals?: ShaderSource,
  level?: number,

  loopX?: boolean,
  loopY?: boolean,
  loopZ?: boolean,
  shaded?: boolean,

  size?: Lazy<[number, number] | [number, number, number] | [number, number, number, number]>,
  mode?: RenderPassMode | string,
  id?: number,
};

const [SIZE_BINDING, POSITION_BINDING] = bundleToAttributes(getSurfaceIndex);

/** @hidden */
export const DualContourLayer: LiveComponent<DualContourLayerProps> = memo((props: DualContourLayerProps) => {
  /*
  const {
    color,

    range,
    values,
    level,

    loopX = false,
    loopY = false,
    loopZ = false,
    shaded = true,

    size,
    mode = 'opaque',
    id = 0,
  } = props;

  const sizeExpr = useMemo(() => () =>
    (props.values as any)?.size ?? resolve(size),
    [props.values, size]);
  const boundSize = useBoundSource(SIZE_BINDING, sizeExpr);

  const countExpr = useOne(() => () => {
    const s = resolve(sizeExpr);
    return ((s[0] || 1) - +!loopX) * ((s[1] || 1) - +!loopY) * ((s[2] || 1) - +!loopZ) * (s[3] || 1);
  }, sizeExpr);

  const defines = useMemo(() => ({LOOP_X: !!loopX, LOOP_Y: !!loopY, LOOP_Z: !!loopZ}), [loopX, loopY, loopZ]);
  const indices = useBoundShader(getSurfaceIndex, [SIZE_BINDING], [boundSize], defines);

  const v = useShaderRef(null, props.values);

  //const xf = useApplyTransform(p);
  //const normals = useBoundShader(getSurfaceNormal, [SIZE_BINDING, POSITION_BINDING], [boundSize, xf], defines);
  */

  return null;
}, 'DualContourLayer');
