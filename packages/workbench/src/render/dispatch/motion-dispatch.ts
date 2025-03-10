import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useOne, useRef, Ref } from '@use-gpu/live';

import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import { useInspectable } from '../../hooks/useInspectable'

import { useRawTextureAccess } from '../../hooks/useRawTextureAccess';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';
import { useUniformSource } from '../../hooks/useUniformSource';

import { useDepthCopy } from '../../pass/depth-copy';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

import { mat4 } from 'gl-matrix';

import motionBinding, { MotionUniforms as MotionUniformsWGSL } from '@use-gpu/wgsl/use/motion.wgsl';

const NO_DEBUG_ARGS: any[] = [];

export const makeMotionUniforms = () => ({
  reprojectionMatrix: {current: mat4.create()},
  inverseReprojectionMatrix: {current: mat4.create()},
});

type MotionDispatchProps = {
  motionUniforms: Record<string, Ref<mat4>>,
};

export const MotionDispatch: LiveComponent = (props: MotionDispatchProps) => {
  const {motionUniforms} = props;
  const {uniforms: viewUniforms} = useViewContext();

  const pc = usePassContext();
  const {
    buffers: {normal, motion},
    bindings: {motion: {update: updateMotion}},
    bindGroups: {view: {layout: globalLayout}},
  } = usePassContext();

  const [normalTarget] = normal;
  const [motionTarget] = motion;

  const {projectionViewMatrix, inverseProjectionViewMatrix} = viewUniforms;
  const {reprojectionMatrix, inverseReprojectionMatrix} = motionUniforms;

  // Copy of last frame's projectionViewMatrix
  const lastPvmRef = useRef<mat4>(mat4.fromValues(projectionViewMatrix.current));

  // Motion-from-depth shader
  const getDepth = useRawTextureAccess(normalTarget.depth).shader;
  const getSample = useShader(getMotionSample, [getDepth]);

  const draw = useDepthCopy(motionTarget, getDepth, getSample, globalLayout);

  // Calculate new forwards/backwards reprojection matrix
  const nextFrame = () =>  {
    const {current: lastPvm} = lastPvmRef;

    const {current: viewPvm} = projectionViewMatrix;
    const {current: viewIpvm} = inverseProjectionViewMatrix;

    const {current: rm} = reprojectionMatrix;
    const {current: irm} = inverseReprojectionMatrix;

    mat4.multiply(rm, lastPvm, viewIpvm);
    mat4.invert(irm, rm);
    mat4.copy(lastPvm, viewPvm);

    updateMotion(motionUniforms);
  };

  return yeet({
    motion: (passEncoder: GPURenderPassEncoder) => {
      nextFrame();
      draw(passEncoder);
    },
  });
};
