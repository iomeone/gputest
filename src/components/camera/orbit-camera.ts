import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { provide, use, useContext, useOne } from '@use-gpu/live';
import { ViewUniforms, UniformAttribute } from '@use-gpu/core/types';
import { VIEW_UNIFORMS, makeProjectionMatrix, makeOrbitMatrix, makeOrbitPosition } from '@use-gpu/core';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { FrameContext } from '../providers/frame-provider';

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

export type OrbitCameraProps = {
  phi: number,
  theta: number,
  radius: number,

  fov?: number,
  near?: number,
  far?: number,
  dolly?: number,

  focus?: number,
  scale?: number | null,

  children?: LiveElement<any>,
};

let t = 0;

export const OrbitCamera: LiveComponent<OrbitCameraProps> = (props) => {
  const {
    width,
    height,
    pixelRatio,
  } = useContext(RenderContext);

  let {
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
  
  const uniforms = useOne(() => ({
    projectionMatrix: { value: null },
    viewMatrix: { value: null },
    viewPosition: { value: null },
    viewResolution: { value: null },
    viewSize: { value: null },
    viewWorldUnit: { value: null },
    viewPixelRatio: { value: null },
  })) as any as ViewUniforms;

  const unit = scale != null ? height / pixelRatio / scale : 1;

  uniforms.projectionMatrix.value = makeProjectionMatrix(width, height, fov, near, far, radius, dolly);
  uniforms.viewMatrix.value = makeOrbitMatrix(radius, phi, theta, dolly);
  uniforms.viewPosition.value = makeOrbitPosition(radius, phi, theta, dolly);
  uniforms.viewResolution.value = [ 1 / width, 1 / height ];
  uniforms.viewSize.value = [ width, height ];
  uniforms.viewWorldUnit.value = focus * Math.tan(fov / 2);
  uniforms.viewPixelRatio.value = pixelRatio * unit;

  return provide(FrameContext, null, use(ViewProvider)({
    defs: VIEW_UNIFORMS, uniforms, children,
  }));
};
