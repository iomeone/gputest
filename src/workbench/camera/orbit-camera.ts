import type { LiveComponent, PropsWithChildren } from '../../live';
import type { VectorLike } from '../../core';

import { useProp } from '../../traits/index-live';
import { parsePosition } from '../../parse';
import { provide, use, useContext, useOne, incrementVersion } from '../../live';
import { makeProjectionMatrix, makeOrbitMatrix, makeViewUniforms, updateViewProjection, updateViewSize } from '../../core';
import { FrameContext } from '../providers/frame-provider';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';

const DEFAULT_ORBIT_CAMERA = {
  phi: 0,
  theta: 0,
  radius: 5,

  focus: 5,
  dolly: 1,

  fov: Math.PI / 3,
  near: 0.001,
  far: 1000,
};

export type OrbitCameraProps = PropsWithChildren<{
  phi?: number,
  theta?: number,
  radius?: number,
  target?: VectorLike,

  fov?: number,
  near?: number,
  far?: number,
  dolly?: number,

  focus?: number,
  scale?: number | null,
}>;

export const OrbitCamera: LiveComponent<OrbitCameraProps> = (props) => {
  const {
    width,
    height,
    pixelRatio,
  } = useContext(RenderContext);

  const {
    phi    = DEFAULT_ORBIT_CAMERA.phi,
    theta  = DEFAULT_ORBIT_CAMERA.theta,
    radius = DEFAULT_ORBIT_CAMERA.radius,
    fov    = DEFAULT_ORBIT_CAMERA.fov,
    near   = DEFAULT_ORBIT_CAMERA.near,
    far    = DEFAULT_ORBIT_CAMERA.far,
    dolly  = DEFAULT_ORBIT_CAMERA.dolly,
    focus  = DEFAULT_ORBIT_CAMERA.focus,
    scale  = null,
    children,
  } = props;

  const target = useProp(props.target, parsePosition);

  const uniforms = useOne(makeViewUniforms);

  const unit = scale != null ? height / pixelRatio / scale : 1;
  const ratio = pixelRatio * unit;
  const tan = Math.tan(fov / 2);

  updateViewProjection(
    uniforms,
    makeProjectionMatrix(width, height, fov, near, far, radius, dolly),
    makeOrbitMatrix(radius, phi, theta, target, dolly),
    undefined,
    near, far,
  );
  updateViewSize(uniforms, width, height, ratio, tan * 2 / height, focus, 1);

  const frame = useOne(() => ({current: 0}));
  frame.current = incrementVersion(frame.current);

  return provide(FrameContext, frame.current,
    use(ViewProvider, {
      uniforms,
      children,
    })
  );
};
