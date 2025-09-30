import type { LiveComponent } from '../../../live';
import type { ViewUniforms } from '../../../core';

import { yeet, useOne, useNoOne, useRef } from '../../../live';
import { wgsl } from '../../../shader/wgsl';
import { mat4 } from 'gl-matrix';

import { useTextureUVToXY, useTextureAccess } from '../../hooks/useTextureAccess';
import { useShader } from '../../hooks/useShader';

import { usePassContext } from '../../providers/pass-provider';

import { useCopySelectDepthSample2 } from '../copy/select-copy';

import { getMotionSample } from '../../../wgsl/motion/motion-samplewgsl';

const selectXY = wgsl`@export fn selectXY(v: vec4<f32>) -> vec2<f32> { return v.xy; }`;
const selectZ = wgsl`@export fn selectZ(v: vec4<f32>) -> f32 { return v.z; }`;
const selectD = wgsl`@export fn selectD(v: vec4<f32>) -> f32 { return v.w; }`;

export const MotionDispatch: LiveComponent = () => {

  const {
    buffers: {normal, motion},
    bindGroups: {view: {layout: globalLayout}},
    views: {pre: {uniforms: viewUniforms}},
  } = usePassContext();

  const [normalTarget] = normal;
  const [motionTarget] = motion;

  const {next, uniforms} = useMotionUniforms(viewUniforms as any);

  // Motion-from-depth shader
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getDepth = useTextureUVToXY(useTextureAccess(normalTarget.depth!)).shader;
  const getSample = useShader(getMotionSample, [getDepth, uniforms.reprojectionMatrix]);
  //const getSample = useShader(getMotionSample, [getDepth, uniforms.reprojectionMatrix, motionDebug]);

  const draw = useCopySelectDepthSample2(
    motionTarget,
    getSample,
    selectD,
    selectXY,
    selectZ,
    globalLayout,
  );

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
  const lastPvmRef = useRef<mat4>(mat4.clone(projectionViewMatrix.current));

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