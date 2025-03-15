import type { LiveComponent } from '@use-gpu/live';
import type { ViewUniforms } from '@use-gpu/core';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useOne, useNoOne, useRef, Ref } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';
import { mat4 } from 'gl-matrix';

import { useRawTextureAccess } from '../../hooks/useRawTextureAccess';
import { useShader } from '../../hooks/useShader';

import { useDeviceContext } from '../../providers/device-provider';
import { usePassContext } from '../../providers/pass-provider';

import { uploadBuffer } from '@use-gpu/core';
import { useRawSource } from '../../hooks/useRawSource';
import { useReadbackStorage } from '../../hooks/useReadbackStorage';
import { useScratchSource } from '../../hooks/useScratchSource';

import { useCopySelectSample2 } from '../copy/select-copy';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

const NO_DEBUG_ARGS: any[] = [];

const selectXY = wgsl`@export fn selectXY(v: vec3<f32>) -> vec2<f32> { return v.xy; }`;
const selectZ = wgsl`@export fn selectZ(v: vec3<f32>) -> f32 { return v.z; }`;

export const MotionDispatch: LiveComponent = () => {

  const {
    buffers: {normal, motion},
    bindGroups: {view: {layout: globalLayout}},
    views: {pre: {uniforms: viewUniforms}},
  } = usePassContext();

  const [normalTarget] = normal;
  const [motionTarget] = motion;

  const {next, uniforms} = useMotionUniforms(viewUniforms);

  /*
  const device = useDeviceContext();
  const motionState = new Uint32Array([0xffffffff, 0, 0x80000000, 0x80000000]);
  const [motionDebug, allocateDebug] = useScratchSource(
    'u32',
    {
      readWrite: true,
      flags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      reserve: 4,
    },
  );
  const {dispatchCopy, asyncRead} = useReadbackStorage(motionDebug);
  */

  // Motion-from-depth shader
  const getDepth = useRawTextureAccess(normalTarget.depth).shader;
  const getSample = useShader(getMotionSample, [getDepth, uniforms.reprojectionMatrix]);
  //const getSample = useShader(getMotionSample, [getDepth, uniforms.reprojectionMatrix, motionDebug]);

  const draw = useCopySelectSample2(
    motionTarget,
    getSample,
    selectXY,
    selectZ,
    globalLayout,
  );

  return yeet({
    motion: (passEncoder: GPURenderPassEncoder) => {
      next();
      draw(passEncoder);
    },
    /*
    dispatch: () => { uploadBuffer(device, motionDebug.buffer, motionState.buffer); }
    post: dispatchCopy,
    readback: async () => {
      const data = await asyncRead();
      console.log(data);
    },
    */
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