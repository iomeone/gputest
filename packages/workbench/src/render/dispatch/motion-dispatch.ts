import type { LiveComponent } from '@use-gpu/live';
import type { ViewUniforms } from '@use-gpu/core';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useOne, useNoOne, useRef, Ref } from '@use-gpu/live';

import { useRawTextureAccess } from '../../hooks/useRawTextureAccess';
import { useShader } from '../../hooks/useShader';

import { usePassContext } from '../../providers/pass-provider';
import { useDepthCopy } from '../../pass/depth-copy';
import { mat4 } from 'gl-matrix';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

const NO_DEBUG_ARGS: any[] = [];

export const MotionDispatch: LiveComponent = () => {
  const pc = usePassContext();
  const {
    buffers: {normal, motion},
    bindGroups: {view: {layout: globalLayout}},
    views: {pre: {uniforms: viewUniforms}},
  } = usePassContext();

  const [normalTarget] = normal;
  const [motionTarget] = motion;

  const {next, uniforms} = useMotionUniforms(viewUniforms);

  // Motion-from-depth shader
  const getDepth = useRawTextureAccess(normalTarget.depth).shader;
  const getSample = useShader(getMotionSample, [getDepth, uniforms.reprojectionMatrix]);

  const draw = useDepthCopy(motionTarget, getDepth, getSample, globalLayout);

  return yeet({
    motion: (passEncoder: GPURenderPassEncoder) => {
      next();
      draw(passEncoder);
    },
  });
};

// Reprojection uniforms
const makeMotionUniforms = () => ({
  reprojectionMatrix: {current: mat4.create()},
  inverseReprojectionMatrix: {current: mat4.create()},
});

export const useMotionUniforms = (
  viewUniforms: Pick<ViewUniforms, 'projectionViewMatrix' | 'inverseProjectionViewMatrix'>,
  maybeUniforms?: Record<string, any>,
) => {
  const {projectionViewMatrix, inverseProjectionViewMatrix} = viewUniforms;

  const uniforms = maybeUniforms ? (useNoOne(), maybeUniforms) : useOne(makeMotionUniforms);
  const {reprojectionMatrix, inverseReprojectionMatrix} = uniforms;

  // Copy of last frame's projectionViewMatrix
  const lastPvmRef = useRef<mat4>(mat4.fromValues(projectionViewMatrix.current));

  // Calculate new forwards/backwards reprojection matrix
  const next = () =>  {
    const {current: lastPvm} = lastPvmRef;

    const {current: viewPvm} = projectionViewMatrix;
    const {current: viewIpvm} = inverseProjectionViewMatrix;

    const {current: rm} = reprojectionMatrix;
    const {current: irm} = inverseReprojectionMatrix;

    mat4.multiply(rm, lastPvm, viewIpvm);
    mat4.invert(irm, rm);
    mat4.copy(lastPvm, viewPvm);
  };
  
  return {next, uniforms};
}

/*
export const useMotionBinding = (
  uniforms: Record<string, Ref<any>>,
  module: ShaderModule = motionBindingWGSL,
  type: ShaderModule = MotionUniformsWGSL,
) => useUniformBinding(uniforms, module, type);
*/