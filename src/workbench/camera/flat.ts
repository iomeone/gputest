import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ViewUniforms, Rectangle } from '@use-gpu/core';

import { use, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import { VIEW_UNIFORMS, makeOrthogonalMatrix } from '@use-gpu/core';
import { LayoutContext } from '../providers/layout-provider';
import { RenderContext } from '../providers/render-provider';
import { FrameContext, usePerFrame } from '../providers/frame-provider';
import { ViewProvider } from '../providers/view-provider';
import { mat4, vec3 } from 'gl-matrix';

const DEFAULT_FLAT_CAMERA = {
  near: -100,
  far: 100,
  focus: 1,
};

export type FlatProps = {
  x?: number,
  y?: number,
  zoom?: number,

  focus?: number,
  scale?: number | null,
  relative?: boolean,

  near?: number,
  far?: number,

  children?: LiveElement<any>,
};

export const Flat: LiveComponent<FlatProps> = (props) => {
  const {
    x = 0,
    y = 0,
    zoom = 1,
    scale = null,
    relative = false,
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

    let left, right, top, bottom;
    if (relative) {
      const a = width / height;
      left = -a;
      right = a;
      top = 1;
      bottom = -1;
    }
    else {
      left = 0;
      top = 0;
      right = w;
      bottom = h;
    }

    const layout = [left, top, right, bottom] as Rectangle;
    const matrix = makeOrthogonalMatrix(left, right, bottom, top, near, far);
    return [layout, matrix, ratio, w, h];
  }, [scale, width, height, pixelRatio]);

  const uniforms = useOne(() => ({
    projectionMatrix: { current: null },
    viewMatrix: { current: mat4.create() },
    viewPosition: { current: null },
    viewNearFar: { current: null },
    viewResolution: { current: null },
    viewSize: { current: null },
    viewWorldDepth: { current: null },
    viewPixelRatio: { current: null },
  })) as any as ViewUniforms;

  const panned = useMemo(() => {
    if (!x && !y && (zoom == 1)) return matrix;

    const m = mat4.create();
    mat4.scale(m, m, vec3.fromValues(zoom, zoom, 1));
    mat4.translate(m, m, vec3.fromValues(x, y, 0));
    
    mat4.multiply(m, matrix, m);
    return m;
  }, [matrix, x, y, zoom]);
  
  const viewHeight = Math.abs(layout[3] - layout[1]);

  uniforms.projectionMatrix.current = panned;
  uniforms.viewPosition.current = [ 0, 0, 1, 1 ];
  uniforms.viewNearFar.current = [ near, far ];
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];
  uniforms.viewWorldDepth.current = [focus * viewHeight / 2.0, viewHeight / (far - near) / 2.0];
  uniforms.viewPixelRatio.current = ratio;

  usePerFrame();
  const frame = useOne(() => ({ current: 0 }));
  frame.current++;

  return (
    provide(FrameContext, {...frame},
      use(ViewProvider, {
        defs: VIEW_UNIFORMS,
        uniforms,
        children: provide(LayoutContext, layout, children),
      })
    )
  );
};
