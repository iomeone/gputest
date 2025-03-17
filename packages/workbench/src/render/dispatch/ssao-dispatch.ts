import type { LiveComponent } from '@use-gpu/live';

import { yeet, useMemo, useOne, useNoOne, useRef } from '@use-gpu/live';

import { usePassContext } from '../../providers/pass-provider';
import { useKeyboard, useMouse, useNoKeyboard, useNoMouse } from '../../providers/event-provider';

import { useTextureAccess, useTextureUVToXY } from '../../hooks/useRawTextureAccess';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDebugContext } from '../../providers/debug-provider';
import { usePrintContext, useNoPrintContext } from '../../providers/print-provider';

import { useCopySample, useCopyDepthSample } from '../copy/value-copy';

import { downsampleExact2 } from '@use-gpu/wgsl/texture/downsample.wgsl';

import { getSSAOSample } from '@use-gpu/wgsl/ssao/ssao-sample.wgsl';
import { getSSAOAccum } from '@use-gpu/wgsl/ssao/ssao-accum.wgsl';
import { getSSAOResolve } from '@use-gpu/wgsl/ssao/ssao-resolve.wgsl';

export type SSAODispatchProps = {
  bindPass?: (r: GPURenderPassEncoder) => void,
  globalLayout?: GPUBindGroupLayout,

  mode: 'normal' | 'motion-xy' | 'motion-z' | 'sample' | 'accum' | 'resolve',
  radius: number,
  depthRamp?: number,
  normalRamp?: number,
  
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
    depthRamp = 10,
    normalRamp = 4,

    targetContext,
    descriptor,
  } = props;

  const {
    buffers: {normal, motion, ssao},
    views: { pre: { uniforms: { overscanMatrix }}},
  } = usePassContext();
  
  const [normalContext] = normal;
  const [motionContext] = motion;

  const [normalTarget, motionXYTarget, motionZTarget, sampleTarget, accumTarget, resolveTarget] = ssao;
  const {pixelRatio} = normalTarget;

  const {ssao: ssaoDebug} = useDebugContext();

  const frame = useRef(0);

  const overscanSize = useShaderRef([normalContext.width, normalContext.height]);
  const downscaleSize = useShaderRef([normalTarget.width, normalTarget.height]);

  const {current: os} = overscanSize;
  const {current: ds} = downscaleSize;

  const xyJitter = () => getJitterBayer2x2Alternating(frame.current);
  const uvScale = useShaderRef([ds[0] / os[0] * 2, ds[1] / os[1] * 2]);
  const uvJitterDelta = () => {
    const [x1, y1] = getJitterBayer2x2Alternating(frame.current);
    const [x2, y2] = getJitterBayer2x2Alternating(frame.current - 1);
    return [
      (x1 - x2) / os[0],
      (y1 - y2) / os[1],
    ];
  };

  const ssaoRadius = useShaderRef(radius);
  const ssaoWeights = useMemo(() => ({DEPTH_RAMP: depthRamp, NORMAL_RAMP: normalRamp}), [depthRamp, normalRamp]);

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

    const u = mouse.x * pixelRatio / resolveTarget.width;
    const v = mouse.y * pixelRatio / resolveTarget.height;
    
    const m = overscanMatrix?.current;

    const sx = m?.[0] ?? 1;
    const sy = m?.[5] ?? 1;
    const dx = (1 - sx) / 2;
    const dy = (1 - sy) / 2;
  
    const mx = Math.round((u * sx + dx) * normalContext.width / 2) * 2;
    const my = Math.round((v * sy + dy) * normalContext.height / 2) * 2;

    const pick = useShaderRef([shouldPick ? mx : -1, shouldPick ? my : -1]);    
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
    const loadDepth = useShader(downsampleExact2, [loadSourceDepth, xyJitter]);
    const getDepth = useTextureUVToXY(loadDepth, downscaleSize).shader;

    const loadSourceNormal16 = useTextureAccess(normalContext.source);
    const loadNormal16 = useShader(downsampleExact2, [loadSourceNormal16, xyJitter]);
    const getNormal16 = useTextureUVToXY(loadNormal16, downscaleSize).shader;

    draw = useCopyDepthSample(targetContext, getDepth, getNormal16, globalLayout);
  }
  else if (mode === 'motion-xy') {
    const loadSourceMotionXY = useTextureAccess(motionContext.sources[0]);
    const loadMotionXY = useShader(downsampleExact2, [loadSourceMotionXY, xyJitter]);
    const getMotionXY = useTextureUVToXY(loadMotionXY, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionXY, globalLayout);
  }
  else if (mode === 'motion-z') {
    const loadSourceMotionZ = useTextureAccess(motionContext.sources[1]);
    const loadMotionZ = useShader(downsampleExact2, [loadSourceMotionZ, xyJitter]);
    const getMotionZ = useTextureUVToXY(loadMotionZ, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionZ, globalLayout);
  }
  else if (mode === 'sample') {
    const defs = useOne(() => ({ HAS_DEBUG_PICKING: hasDebugPicking }));

    const loadDepth = useTextureAccess(normalTarget.depth);
    const loadNormal16 = useTextureAccess(normalTarget.source);

    const getSample = useShader(getSSAOSample, [
      loadNormal16,
      loadDepth,
      overscanSize,
      downscaleSize,
      xyJitter,
      ssaoRadius,
      frame,
      ...debugArgs,
    ], defs);

    draw = useCopySample(targetContext, getSample, globalLayout);
  }
  else if (mode === 'accum') {
    const defs = ssaoWeights;

    const loadSample = useTextureAccess(sampleTarget.source);
    const loadMotionXY = useTextureAccess(motionXYTarget.source);
    const loadMotionZ = useTextureAccess(motionZTarget.source);
    const loadLastAccum = useTextureAccess(accumTarget.source.history?.[0]);

    const loadDepth = useTextureAccess(normalTarget.depth);
    const loadNormal16 = useTextureAccess(normalTarget.source);
    const loadLastDepth = useTextureAccess(normalTarget.depth.history?.[0]);
    const loadLastNormal16 = useTextureAccess(normalTarget.source.history?.[0]);

    const getAccum = useShader(getSSAOAccum, [
      loadSample,
      loadMotionXY,
      loadMotionZ,
      loadLastAccum,

      loadNormal16,
      loadDepth,
      loadLastNormal16,
      loadLastDepth,

      uvScale,
      uvJitterDelta,
      downscaleSize,
      frame,
      debugArgs?.[3],
    ], defs);

    draw = useCopySample(targetContext, getAccum, globalLayout);
  }
  else if (mode === 'resolve') {
    const defs = ssaoWeights;

    const m = overscanMatrix?.current;
    const overscanScale = useShaderRef([m?.[0] ?? 1, m?.[5] ?? 1]);

    const loadTargetDepth = useTextureAccess(normalContext.depth);
    const getTargetDepth = useTextureUVToXY(loadTargetDepth).shader;

    const loadTargetNormal16 = useTextureAccess(normalContext.source);
    const getTargetNormal16 = useTextureUVToXY(loadTargetNormal16).shader;

    const loadNormal16 = useTextureAccess(normalTarget.source);
    const loadDepth = useTextureAccess(normalTarget.depth);
    const loadSample = useTextureAccess(accumTarget.source);

    const getResolve = useShader(getSSAOResolve, [
      getTargetNormal16,
      getTargetDepth,
      loadNormal16,
      loadDepth,
      loadSample,
      overscanScale,
      downscaleSize,
      xyJitter,
    ], defs);

    draw = useCopySample(targetContext, getResolve, globalLayout);
  }

  if (!draw) return null;

  const command = (commandEncoder: GPUCommandEncoder) => {
    if (mode === 'accum') {
      if (shouldClear) clearDebugBuffer?.();
      shouldClear = false;
    }

    targetContext.swap?.();

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

  // Note: jitter disabled for now, need to investigate if it's useful
  return [0, 0];
  return [x, y];
};
