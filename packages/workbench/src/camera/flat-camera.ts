import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Rectangle } from '@use-gpu/core';

import { use, provide, deprecated, useContext, useOne, useMemo, incrementVersion } from '@use-gpu/live';
import { VIEW_UNIFORMS, makeOrthogonalMatrix, makeFrustumPlanes, makeViewUniforms, updateViewUniforms } from '@use-gpu/core';
import { LayoutContext } from '../providers/layout-provider';
import { FrameContext, usePerFrame } from '../providers/frame-provider';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';

const DEFAULT_FLAT_CAMERA = {
  near: -100,
  far: 100,
  focus: 1,
};

export type FlatCameraProps = PropsWithChildren<{
  x?: number,
  y?: number,
  zoom?: number,

  focus?: number,
  scale?: number | null,
  relative?: boolean,

  near?: number,
  far?: number,
}>;

export const FlatCamera: LiveComponent<FlatCameraProps> = (props) => {
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

  usePerFrame();

  const [layout, matrix, ratio] = useMemo(() => {
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
    return [layout, matrix, ratio];
  }, [scale, width, height, pixelRatio]);

  const uniforms = useOne(makeViewUniforms);

  const panned = useMemo(() => {
    if (!x && !y && (zoom == 1)) return matrix;

    const m = mat4.create();
    mat4.scale(m, m, vec3.fromValues(zoom, zoom, 1));
    mat4.translate(m, m, vec3.fromValues(x, y, 0));

    mat4.multiply(m, matrix, m);
    return m;
  }, [matrix, x, y, zoom]);

  const viewHeight = Math.abs(layout[3] - layout[1]);

  updateViewUniforms(uniforms, panned, undefined, vec4.fromValues(0, 0, 1, 0));

  uniforms.viewNearFar.current = vec2.fromValues(near, far);
  uniforms.viewResolution.current = vec2.fromValues(1 / width, 1 / height);
  uniforms.viewSize.current = vec2.fromValues(width, height);
  uniforms.viewWorldDepth.current = vec2.fromValues(focus * viewHeight / 2.0, viewHeight / (far - near) / 2.0);
  uniforms.viewPixelRatio.current = ratio;

  const frame = useOne(() => ({current: 0}));
  frame.current = incrementVersion(frame.current);

  return provide(FrameContext, frame.current,
    use(ViewProvider, {
      defs: VIEW_UNIFORMS,
      uniforms,
      children: provide(LayoutContext, layout, children),
    })
  );
};

export const Flat = deprecated(FlatCamera, 'Flat');
