import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { useContext, useOne } from '@use-gpu/live';
import { ViewUniforms, UniformAttribute } from '@use-gpu/core/types';
import { VIEW_UNIFORMS, makeProjectionMatrix, makeOrbitMatrix, makeOrbitPosition } from '@use-gpu/core';
import { RenderContext } from '../providers/render-provider';

const DEFAULT_ORBIT_CAMERA = {
  phi: 0,
  theta: 0,
  radius: 5,
  fov: Math.PI / 3,
  near: 0.01,
  far: 100,
};

export type OrbitCameraProps = {
  width: number,
  height: number,
  phi: number,
  theta: number,
  radius: number,

  fov?: number,
  near?: number,
  far?: number,
  render: (defs: UniformAttribute[], uniforms: ViewUniforms) => LiveElement<any>,
};

export const OrbitCamera: LiveComponent<OrbitCameraProps> = (fiber) => (props) => {
  const {
    width,
    height,
  } = useContext(RenderContext);

  const {
    phi    = DEFAULT_ORBIT_CAMERA.phi,
    theta  = DEFAULT_ORBIT_CAMERA.theta,
    radius = DEFAULT_ORBIT_CAMERA.radius,
    fov    = DEFAULT_ORBIT_CAMERA.fov,
    near   = DEFAULT_ORBIT_CAMERA.near,
    far    = DEFAULT_ORBIT_CAMERA.far,
    render,
  } = props;
  
  const uniforms = useOne(() => ({
    projectionMatrix: { value: null },
    viewMatrix: { value: null },
    viewPosition: { value: null },
    viewResolution: { value: null },
    viewSize: { value: null },
  })) as any as ViewUniforms;

  uniforms.projectionMatrix.value = makeProjectionMatrix(width, height, fov, near, far);
  uniforms.viewMatrix.value = makeOrbitMatrix(radius, phi, theta);
  uniforms.viewPosition.value = makeOrbitPosition(radius, phi, theta);
  uniforms.viewResolution.value = [ 1/width, 1/height ];
  uniforms.viewSize.value = [ width, height ];

  return render(VIEW_UNIFORMS, uniforms);
};
