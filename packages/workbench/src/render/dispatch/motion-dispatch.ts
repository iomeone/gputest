import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useRef } from '@use-gpu/live';

import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import { useRawTextureAccess } from '../../hooks/useRawTextureAccess';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDepthCopy } from '../../pass/depth-copy';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

import { mat4 } from 'gl-matrix';

const NO_DEBUG_ARGS: any[] = [];

export const MotionDispatch: LiveComponent = () => {
  const {uniforms} = useViewContext();
  const {
    buffers: {normal, motion},
    bindGroups: {view: {layout: globalLayout}},
  } = usePassContext();

  const [normalTarget] = normal;
  const [motionTarget] = motion;

  const pvmRef = useRef<mat4>(mat4.fromValues(uniforms.projectionViewMatrix.current));
  const reprojectionRef = useRef<mat4>(mat4.create());

  const getDepth = useRawTextureAccess(normalTarget.depth).shader;
  const getSample = useShader(getMotionSample, [getDepth, reprojectionRef]);

  const draw = useDepthCopy(motionTarget, getDepth, getSample, globalLayout);

  return yeet({
    motion: (passEncoder: GPURenderPassEncoder) => {
      const {current: pvm} = pvmRef;
      const {current: reproj} = reprojectionRef;

      const ipvm = uniforms.inverseProjectionViewMatrix.current;
      mat4.multiply(reproj, pvm, ipvm);

      draw(passEncoder);

      mat4.copy(pvm, uniforms.projectionViewMatrix.current);
    },
  });
};
