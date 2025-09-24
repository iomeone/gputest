import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { LayoutState } from './types';

import { use, provide, makeContext, useContext, useOne, useMemo } from '@use-gpu/live';
import { ViewUniforms, UniformAttribute } from '@use-gpu/core/types';
import { VIEW_UNIFORMS, makeOrthogonalMatrix } from '@use-gpu/core';
import { LayoutContext } from '../providers/layout-provider';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { mat4 } from 'gl-matrix';

const DEFAULT_FLAT_CAMERA = {
  near: 0,
  far: 1,
  focus: 1,
};

export type FlatProps = {
  focus?: number,
  scale?: number | null,

  near?: number,
  far?: number,

  children?: LiveElement<any>,
};

export const Flat: LiveComponent<FlatProps> = (props) => {
  const {
    scale = null,
    focus = DEFAULT_FLAT_CAMERA.focus,
    near = DEFAULT_FLAT_CAMERA.near,
    far = DEFAULT_FLAT_CAMERA.far,
    children,
  } = props;

  const {
    width,
    height,
    pixelRatio,
  } = useContext(RenderContext);

  const [layout, matrix, ratio, w, h] = useMemo(() => {
    const unit = scale != null ? height / pixelRatio / scale : 1;
    const ratio = unit * pixelRatio;

    const w = Math.floor(width / ratio);
    const h = Math.floor(height / ratio);

    const left = 0;
    const top = 0;
    const right = w;
    const bottom = h;
    const layout = [left, top, right, bottom] as LayoutState;

    const matrix = makeOrthogonalMatrix(left, right, bottom, top, -near, -far);

    return [layout, matrix, ratio, w, h];
  }, [scale, width, height, pixelRatio]);

  const uniforms = useOne(() => ({
    projectionMatrix: { value: null },
    viewMatrix: { value: mat4.create() },
    viewPosition: { value: null },
    viewResolution: { value: null },
    viewSize: { value: null },
    viewWorldUnit: { value: null },
    viewPixelRatio: { value: null },
  })) as any as ViewUniforms;

  uniforms.projectionMatrix.value = matrix;
  //uniforms.viewMatrix.value = ;
  uniforms.viewPosition.value = [ 0, 0, 1, 0 ];
  uniforms.viewResolution.value = [ 1 / width, 1 / height ];
  uniforms.viewSize.value = [ width, height ];
  uniforms.viewWorldUnit.value = focus;
  uniforms.viewPixelRatio.value = ratio;

  return use(ViewProvider)({
    defs: VIEW_UNIFORMS,
    uniforms,
    children: provide(LayoutContext, layout, children),
  });
};
