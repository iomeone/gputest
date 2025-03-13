import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useOne, useNoOne, useRef } from '@use-gpu/live';

import { usePassContext } from '../../providers/pass-provider';
import { useKeyboard, useMouse, useNoKeyboard, useNoMouse } from '../../providers/event-provider';

import { useLambdaSource } from '../../hooks/useLambdaSource';
import { useRawTextureAccess, useTextureAccess, useTextureUVToXY } from '../../hooks/useRawTextureAccess';
import { useSource } from '../../hooks/useSource';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDebugContext } from '../../providers/debug-provider';
import { usePrintContext, useNoPrintContext } from '../../providers/print-provider';

import { useCopySample, useCopyDepthSample } from '../copy/value-copy';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

import { downsampleExact2 } from '@use-gpu/wgsl/texture/downsample.wgsl';

import { getSSAOSample } from '@use-gpu/wgsl/ssao/ssao-sample.wgsl';
import { getSSAOAccum } from '@use-gpu/wgsl/ssao/ssao-accum.wgsl';
import { getSSAOResolve } from '@use-gpu/wgsl/ssao/ssao-resolve.wgsl';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';

import renderVirtualSolid from '@use-gpu/wgsl/render/vertex/virtual-solid.wgsl';
import renderFragmentSolid from '@use-gpu/wgsl/render/fragment/solid.wgsl';

import { mat4 } from 'gl-matrix';

export type SSAODispatchProps = {
  bindPass?: (r: GPURenderPassEncoder) => void,
  globalLayout?: GPUBindGroupLayout,

  mode: 'normal' | 'motion-xy' | 'motion-z' | 'sample' | 'accum' | 'resolve',
  radius: number,
  targetContext: UseGPURenderContext,
  descriptor: GPURenderPassDescriptor,
};

const NO_DEBUG_ARGS: any[] = [];

export const SSAODispatch: LiveComponent<SSAODispatchProps> = (props: SSAODispatchProps) => {
  const {
    bindPass,
    globalLayout,
    
    mode, // static
    radius = 32,

    targetContext,
    descriptor,
  } = props;

  const {
    buffers: {normal, motion, ssao},
  } = usePassContext();
  
  const [normalContext] = normal;
  const [motionContext] = motion;

  const [normalTarget, motionXYTarget, motionZTarget, sampleTarget, accumTarget, resolveTarget] = ssao;
  const {pixelRatio} = normalTarget;

  const {ssao: ssaoDebug} = useDebugContext();

  const frame = useRef(0);
  const ssaoRadius = useShaderRef(radius);

  const resolveSize = useShaderRef([resolveTarget.width, resolveTarget.height]);
  const overscanSize = useShaderRef([resolveTarget.width, normalContext.height]);
  const downscaleSize = useShaderRef([normalTarget.width, normalTarget.height]);

  const uvScale = useShaderRef([downscaleSize[0] / overscanSize[0], downscaleSize[1] / overscanSize[1]]);
  const uvJitterDelta = () => {
    const [x1, y1] = getJitterBayer2x2Alternating(frame.current);
    const [x2, y2] = getJitterBayer2x2Alternating(frame.current - 1);
    return [
      (x1 - x2) / downscaleSize[0],
      (y1 - y2) / downscaleSize[1],
    ];
  }

  const downscaleJitter = () => getJitterBayer2x2Alternating(frame.current);

  //const downscaleOffset = () => getResampleOffset(normalContext.source.size, normalTarget.source.size, frame.current);

  // Debug viz
  const hasDebugPicking = !!ssaoDebug?.pickAO;
  let debugArgs = NO_DEBUG_ARGS;
  let clearDebugBuffer = null;
  let shouldClear = false;

  if (hasDebugPicking) {
    const {swap, shaders: {printPoint, printLine, printData}} = usePrintContext();
    const {keyboard} = useKeyboard();
    const {mouse} = useMouse();

    const shouldPick = keyboard.keys.alt;
    clearDebugBuffer = swap;

    useOne(() => { if (shouldPick) shouldClear = true; }, shouldPick);
    useOne(() => { if (shouldPick) shouldClear = true; }, mouse);

    const pick = useShaderRef([shouldPick ? mouse.x / 2 * pixelRatio : -1, shouldPick ? mouse.y / 2 * pixelRatio : -1]);    
    debugArgs = [pick, printPoint, printLine, printData];
  }
  else {
    useNoPrintContext();
    useNoKeyboard();
    useNoMouse();
    useNoOne();
    useNoOne();
  }

  let draw;
  if (mode === 'normal') {
    const loadSourceDepth = useTextureAccess(normalContext.depth);
    const loadDepth = useShader(downsampleExact2, [loadSourceDepth, downscaleJitter]);
    const getDepth = useTextureUVToXY(loadDepth, downscaleSize).shader;

    const loadSourceNormal16 = useTextureAccess(normalContext.source);
    const loadNormal16 = useShader(downsampleExact2, [loadSourceNormal16, downscaleJitter]);
    const getNormal16 = useTextureUVToXY(loadNormal16, downscaleSize).shader;

    draw = useCopyDepthSample(targetContext, getDepth, getNormal16, globalLayout);
  }
  else if (mode === 'motion-xy') {
    const loadSourceMotionXY = useTextureAccess(motionContext.sources[0]);
    const loadMotionXY = useShader(downsampleExact2, [loadSourceMotionXY, downscaleJitter]);
    const getMotionXY = useTextureUVToXY(loadMotionXY, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionXY, globalLayout);
  }
  else if (mode === 'motion-z') {
    const loadSourceMotionZ = useTextureAccess(motionContext.sources[1]);
    const loadMotionZ = useShader(downsampleExact2, [loadSourceMotionZ, downscaleJitter]);
    const getMotionZ = useTextureUVToXY(loadMotionZ, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionZ, globalLayout);
  }
  else if (mode === 'sample') {
    const r = useShaderRef(radius);
    const defs = useOne(() => ({ HAS_DEBUG_PICKING: hasDebugPicking }))

    const loadDepth = useTextureAccess(normalTarget.depth);
    const loadNormal16 = useTextureAccess(normalTarget.source);

    const getSample = useShader(getSSAOSample, [
      loadNormal16,
      loadDepth,
      overscanSize,
      downscaleSize,
      downscaleJitter,
      ssaoRadius,
      frame,
      ...debugArgs,
    ], defs);

    draw = useCopySample(targetContext, getSample, globalLayout);
  }
  else if (mode === 'accum') {

    const loadDepth = useTextureAccess(normalTarget.depth);
    const loadNormal16 = useTextureAccess(normalTarget.source);
    const loadSample = useTextureAccess(sampleTarget.source);
    const loadMotionXY = useTextureAccess(motionXYTarget.source);
    const loadMotionZ = useTextureAccess(motionXYTarget.source);

    const loadLastAccum = useTextureAccess(accumTarget.source.history![0]);

    const getAccum = useShader(getSSAOAccum, [
      loadNormal16,
      loadDepth,
      loadSample,
      loadMotionXY,
      loadMotionZ,
      loadLastAccum,
      uvScale,
      uvJitterDelta,
      downscaleSize,
      frame,
      debugArgs?.[3],
    ]);

    draw = useCopySample(targetContext, getAccum, globalLayout);
  }
  /*
  else if (mode === 'resolve') {

    const getTargetNormal16 = useRawTextureAccess(normalContext.source, downscaleOffset).shader;
    const getTargetDepth = useRawTextureAccess(normalContext.depth, downscaleOffset).shader;

    const getNormal16 = useTextureAccess(normalTarget.source);
    const getDepth = useTextureAccess(normalTarget.depth);

    const getSample = useTextureAccess(accumTarget.source);
    const getResolve = useShader(getSSAOResolve, [
      getTargetNormal16,
      getTargetDepth,
      getNormal16,
      getDepth,
      getSample,
      fullSize,
      downscaleSize,
      downscaleOffset,
    ]);

    draw = useCopySample(targetContext, getResolve, globalLayout);
  }
  */

  if (!draw) return null;

  const command = (commandEncoder: GPUCommandEncoder) => {
    if (mode === 'accum') {
      if (shouldClear) clearDebugBuffer?.();
      shouldClear = false;
    }

    targetContext?.swap();

    const passEncoder = commandEncoder.beginRenderPass(descriptor);
    bindPass?.(passEncoder);
    frame.current = (frame.current + 1) % 0xffff;
    draw(passEncoder);
    passEncoder.end();
  };

  return yeet({ ssao: command });
};

const getJitterBayer2x2Alternating = (jitter: number) => {
  const i = jitter & 0x7;
  const a = (i & 1);
  const b = (i & 1) ^ ((i & 2) >> 1);

  const x = (i & 4) ? a : b;
  const y = (i & 4) ? b : a;

  return [x, y];
};

/*
const getResampleOffset = (fromSize: VectorLike, toSize: VectorLike, jitter: number) => {
  const [x, y] = getJitterBayer2x2(jitter);

  const [w1, h1] = fromSize;
  const [w2, h2] = toSize;
  
  return [(.5+x)/w1 - .5/w2, (.5+y)/h1 - .5/h2];
};
*/
