import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parsePosition } from '@use-gpu/parse';
import { provide, use, useContext, useOne, incrementVersion } from '@use-gpu/live';
import { VIEW_UNIFORMS, makeProjectionMatrix, makeViewUniforms, updateViewUniforms } from '@use-gpu/core';
import { FrameContext } from '../providers/frame-provider';
import { LayoutContext } from '../providers/layout-provider';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { vec2, vec3, mat4 } from 'gl-matrix';

const DEFAULT_CUBE_CAMERA = {
  near: 0.001,
  far: 1000,
  focus: 1,
};

const τ = Math.PI * 2;

export type CubeCameraProps = PropsWithChildren<{
  position?: VectorLike,

  near?: number,
  far?: number,

  focus?: number,
  scale?: number | null,
}>;

export const CubeCamera: LiveComponent<CubeCameraProps> = (props) => {
  const {
    width,
    height,
    pixelRatio,
  } = useContext(RenderContext);

  const layout = useContext(LayoutContext);

  const {
    near   = DEFAULT_CUBE_CAMERA.near,
    far    = DEFAULT_CUBE_CAMERA.far,
    focus  = DEFAULT_CUBE_CAMERA.focus,
    scale  = null,
    children,
  } = props;

  const position = useProp(props.position, parsePosition);

  const uniforms = useOne(makeViewUniforms);

  const fov = τ / 4;
  const unit = scale != null ? height / pixelRatio / scale : 1;

  const m = useOne(mat4.create);

  const viewMatrix = mat4.fromTranslation(m, position as vec3);
  m[12] = -m[12];
  m[13] = -m[13];
  m[14] = -m[14];

  updateViewUniforms(
    uniforms,
    makeProjectionMatrix(width, height, fov, near, far),
    viewMatrix,
  );
  
  uniforms.viewNearFar.current = vec2.fromValues(near, far);
  uniforms.viewResolution.current = vec2.fromValues(1 / width, 1 / height);
  uniforms.viewSize.current = vec2.fromValues(width, height);
  uniforms.viewWorldDepth.current = vec2.fromValues(focus, 1);
  uniforms.viewPixelRatio.current = pixelRatio * unit;

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
