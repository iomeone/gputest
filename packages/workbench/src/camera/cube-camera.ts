import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parsePosition } from '@use-gpu/parse';
import { provide, use, useContext, useOne, incrementVersion } from '@use-gpu/live';
import { makeProjectionMatrix, makeViewUniforms, updateViewProjection, updateViewSize } from '@use-gpu/core';
import { FrameContext } from '../providers/frame-provider';
import { LayoutContext } from '../providers/layout-provider';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { vec3, mat4 } from 'gl-matrix';

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

  updateViewProjection(
    uniforms,
    makeProjectionMatrix(width, height, fov, near, far),
    viewMatrix,
    undefined,
    near, far,
  );

  updateViewSize(uniforms, width, height, pixelRatio * unit, focus, 1);

  const frame = useOne(() => ({current: 0}));
  frame.current = incrementVersion(frame.current);

  return provide(FrameContext, frame.current,
    use(ViewProvider, {
      uniforms,
      children: provide(LayoutContext, layout, children),
    })
  );
};
