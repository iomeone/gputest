import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { provide, use, useContext, useOne } from '@use-gpu/live';
import { ViewUniforms, UniformAttribute } from '@use-gpu/core/types';
import { VIEW_UNIFORMS, makeProjectionMatrix, makeOrbitMatrix, makeOrbitPosition } from '@use-gpu/core';
import { RenderContext } from '../providers/render-provider';
import { ViewProvider } from '../providers/view-provider';
import { FrameContext, usePerFrame } from '../providers/frame-provider';

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
    projectionMatrix: { current: null },
    viewMatrix: { current: null },
    viewNearFar: { current: null },
    viewPosition: { current: null },
    viewResolution: { current: null },
    viewSize: { current: null },
    viewWorldUnit: { current: null },
    viewPixelRatio: { current: null },
  })) as any as ViewUniforms;

  const unit = scale != null ? height / pixelRatio / scale : 1;

  usePerFrame();
  const frame = useOne(() => ({ current: 0 }));
  frame.current++;

  uniforms.projectionMatrix.current = makeProjectionMatrix(width, height, fov, near, far, radius, dolly);
  uniforms.viewMatrix.current = makeOrbitMatrix(radius, phi, theta, dolly);
  uniforms.viewPosition.current = makeOrbitPosition(radius, phi, theta, dolly);
  uniforms.viewNearFar.current = [ near, far ];
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];
  uniforms.viewWorldUnit.current = focus * Math.tan(fov / 2);
  uniforms.viewPixelRatio.current = pixelRatio * unit;

  return provide(FrameContext, {...frame},
    use(ViewProvider, {
      defs: VIEW_UNIFORMS, uniforms, children,
    })
  );
};
