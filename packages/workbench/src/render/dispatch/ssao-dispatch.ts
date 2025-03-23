import type { LiveComponent, Ref } from '@use-gpu/live';
import type { OffscreenTarget, UseGPURenderContext } from '@use-gpu/core';

import { yeet, useMemo, useOne, useRef } from '@use-gpu/live';
import { chainTo } from '@use-gpu/shader/wgsl';

import { usePassContext } from '../../providers/pass-provider';
import { useKeyboard, useMouse } from '../../providers/event-provider';

import { useTextureAccess, useTextureUVToXY } from '../../hooks/useTextureAccess';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDebugContext } from '../../providers/debug-provider';
import { usePrintContext, useNoPrintContext } from '../../providers/print-provider';

import { useCopySample, useCopyDepthSample } from '../copy/value-copy';

import { downsampleExact2 } from '@use-gpu/wgsl/texture/downsample.wgsl';

import { getSSAOSample } from '@use-gpu/wgsl/ssao/ssao-sample.wgsl';
import { getSSAOAccum } from '@use-gpu/wgsl/ssao/ssao-accum.wgsl';
import { getSSAOResolve } from '@use-gpu/wgsl/ssao/ssao-resolve.wgsl';
import { decodeNormal16, octaToNormal, octaToNormal16 } from '@use-gpu/wgsl/codec/normal16.wgsl';

export type SSAODispatchProps = {
  bindPass?: (r: GPURenderPassEncoder) => void,
  globalLayout?: GPUBindGroupLayout,

  mode: 'normal' | 'motion-xy' | 'motion-z' | 'sample' | 'accum' | 'resolve',

  radius: number,
  depthRamp: number,
  normalRamp: number,
  temporalBlend: number,
  
  targetContext: UseGPURenderContext,
  descriptor: GPURenderPassDescriptor,

  // Debug picking
  mouseRef: Ref<[number, number]>,
};

const NO_DEBUG_ARGS: any[] = [];

export const SSAODispatch: LiveComponent<SSAODispatchProps> = (props: SSAODispatchProps) => {
  const {
    bindPass,
    globalLayout,
    
    mode, // static
    radius,
    depthRamp,
    normalRamp,
    temporalBlend,

    targetContext,
    descriptor,

    mouseRef,
  } = props;

  const {
    buffers: {normal, motion, ssao},
    views: { pre: { uniforms: { overscanMatrix }}},
  } = usePassContext();
  
  const [normalContext] = normal;
  const [motionContext] = motion;

  const [normalTarget, motionXYTarget, motionZTarget, sampleTarget, accumTarget] = ssao as OffscreenTarget[];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalContextDepth = normalContext.depth!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalContextSource = normalContext.source!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const motionContextXYSource = motionContext.sources![0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const motionContextZSource = motionContext.sources![1];
  
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalDepth = normalTarget.depth!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalSource = normalTarget.source!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastNormalDepth = normalTarget.depth!.history![0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastNormalSource = normalTarget.source!.history![0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastAccumSource = accumTarget.source!.history![0];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const motionXYSource = motionXYTarget.source!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const motionZSource = motionZTarget.source!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sampleSource = sampleTarget.source!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const accumSource = accumTarget.source!;

  const frame = useRef(0);

  const overscanSize = useShaderRef([normalContext.width, normalContext.height]);
  const downscaleSize = useShaderRef([normalTarget.width, normalTarget.height]);

  const {current: os} = overscanSize;
  const {current: ds} = downscaleSize;

  const xyJitter = () => getNoJitter(frame.current);
  const uvScale = useShaderRef([ds[0] / os[0] * 2, ds[1] / os[1] * 2]);
  const uvJitterDelta = () => {
    const [x1, y1] = getNoJitter(frame.current);
    const [x2, y2] = getNoJitter(frame.current - 1);
    return [
      (x1 - x2) / os[0],
      (y1 - y2) / os[1],
    ];
  };

  const ssaoRadius = useShaderRef(radius);
  const ssaoBlend = useShaderRef(temporalBlend);
  const ssaoWeights = useMemo(() => ({DEPTH_RAMP: depthRamp, NORMAL_RAMP: normalRamp}), [depthRamp, normalRamp]);

  // Debug viz
  let debugArgs = NO_DEBUG_ARGS;
  if (mouseRef) {
    const {shaders: {printPoint, printLine, printData}} = usePrintContext();
    debugArgs = [mouseRef, printPoint, printLine, printData];
  }
  else {
    useNoPrintContext();
  }

  type Draw = (r: GPURenderPassEncoder) => void;
  let draw: Draw | null = null;
  if (mode === 'normal') {
    const loadSourceDepth = useTextureAccess(normalContextDepth);
    const loadDepth = useShader(downsampleExact2, [loadSourceDepth, xyJitter]);
    const getDepth = useTextureUVToXY(loadDepth, downscaleSize).shader;

    const {format} = normalContextSource;
    const loadSourceNormal = useTextureAccess(normalContextSource).shader;
    const loadSourceNormal16 = useMemo(() => {
      if (format.match(/uint/)) return loadSourceNormal;
      return chainTo(loadSourceNormal, octaToNormal16);
    }, [format, loadSourceNormal]);

    const loadNormal16 = useShader(downsampleExact2, [loadSourceNormal16, xyJitter]);
    const getNormal16 = useTextureUVToXY(loadNormal16, downscaleSize).shader;

    draw = useCopyDepthSample(targetContext, getDepth, getNormal16, globalLayout);
  }
  else if (mode === 'motion-xy') {
    const loadSourceMotionXY = useTextureAccess(motionContextXYSource);
    const loadMotionXY = useShader(downsampleExact2, [loadSourceMotionXY, xyJitter]);
    const getMotionXY = useTextureUVToXY(loadMotionXY, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionXY, globalLayout);
  }
  else if (mode === 'motion-z') {
    const loadSourceMotionZ = useTextureAccess(motionContextZSource);
    const loadMotionZ = useShader(downsampleExact2, [loadSourceMotionZ, xyJitter]);
    const getMotionZ = useTextureUVToXY(loadMotionZ, downscaleSize).shader;

    draw = useCopySample(targetContext, getMotionZ, globalLayout);
  }
  else if (mode === 'sample') {
    const defs = useOne(() => ({ HAS_DEBUG_PICKING: !!mouseRef }));

    const loadDepth = useTextureAccess(normalDepth);
    const loadNormal16 = useTextureAccess(normalSource);

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

    const loadSample = useTextureAccess(sampleSource);
    const loadMotionXY = useTextureAccess(motionXYSource);
    const loadMotionZ = useTextureAccess(motionZSource);
    const loadLastAccum = useTextureAccess(lastAccumSource);

    const loadDepth = useTextureAccess(normalDepth);
    const loadNormal16 = useTextureAccess(normalSource);
    const loadLastDepth = useTextureAccess(lastNormalDepth);
    const loadLastNormal16 = useTextureAccess(lastNormalSource);

    const getAccum = useShader(getSSAOAccum, [
      loadSample,
      loadMotionXY,
      loadMotionZ,
      loadLastAccum,

      loadNormal16,
      loadDepth,
      loadLastNormal16,
      loadLastDepth,

      ssaoBlend,
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

    const loadTargetDepth = useTextureAccess(normalContextDepth);
    const getTargetDepth = useTextureUVToXY(loadTargetDepth).shader;

    const {format} = normalContextSource;
    const loadTargetNormalRaw = useTextureAccess(normalContextSource);
    const loadTargetNormal = useMemo(() => {
      if (format.match(/uint/)) return chainTo(loadTargetNormalRaw.shader, decodeNormal16);
      return chainTo(loadTargetNormalRaw.shader, octaToNormal);
    }, [format, loadTargetNormalRaw]);
    const getTargetNormal = useTextureUVToXY(loadTargetNormal, loadTargetNormalRaw.size).shader;

    const loadNormal16 = useTextureAccess(normalSource);
    const loadDepth = useTextureAccess(normalDepth);
    const loadSample = useTextureAccess(accumSource);

    const getResolve = useShader(getSSAOResolve, [
      getTargetNormal,
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
    targetContext.swap?.();

    const passEncoder = commandEncoder.beginRenderPass(descriptor);
    bindPass?.(passEncoder);
    draw?.(passEncoder);
    passEncoder.end();

    frame.current = (frame.current + 1) % 0xffff;
  };

  return yeet({ ssao: command });
};

export type SSAODebugPickingProps = {
  mouseRef: Ref<[number, number]>,
};

// Debug viz mouse picking
// This logic is contained here so as to not invalidate the actual render dispatches on mouse move.
export const SSAODebugPicking = (props: SSAODebugPickingProps) => {
  const {mouseRef} = props;
  const {ssao: ssaoDebug} = useDebugContext();

  const {
    buffers: {ssao: [normalTarget,,,,, resolveTarget]},
    views: { pre: { uniforms: { overscanMatrix }}},
  } = usePassContext();

  // Hook into pre-existing print helper context
  const {swap: clearDebugBuffer} = usePrintContext();

  // Pick when holding ALT
  const {keyboard} = useKeyboard();
  const {mouse} = useMouse();

  const shouldPick = keyboard.keys.alt;
  const shouldClearRef = useRef(false);

  // Clear when starting picking, or when moving mouse
  useOne(() => { if (shouldPick) shouldClearRef.current = true; }, shouldPick);
  useOne(() => { if (shouldPick) shouldClearRef.current = true; }, mouse);

  const {pixelRatio} = resolveTarget;
  const u = mouse.x * pixelRatio / resolveTarget.width;
  const v = mouse.y * pixelRatio / resolveTarget.height;

  // Reproject UV into overscan range
  const m = overscanMatrix?.current;
  const applyOverscan = !!ssaoDebug?.overscan;

  const sx = applyOverscan ? m?.[0] ?? 1 : 1;
  const sy = applyOverscan ? m?.[5] ?? 1 : 1;
  const dx = applyOverscan ? (1 - sx) / 2 : 0;
  const dy = applyOverscan ? (1 - sy) / 2 : 0;
  
  // Snap to even source pixels
  const mx = Math.round((u * sx + dx) * normalTarget.width) * 2;
  const my = Math.round((v * sy + dy) * normalTarget.height) * 2;

  mouseRef.current = [shouldPick ? mx : -1, shouldPick ? my : -1];

  return useMemo(() => {
    const command = () => {
      if (!shouldClearRef.current) return;

      clearDebugBuffer?.();
      shouldClearRef.current = false;
    };

    return yeet({ ssao: command });
  }, [clearDebugBuffer]);
};

// Note: jitter disabled for now, need to investigate if it's useful
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNoJitter = (frame: number) => {
  return [0, 0];
}

/*
const getJitterBayer2x2Alternating = (jitter: number) => {
  const i = jitter & 0x7;
  const a = (i & 1);
  const b = (i & 1) ^ ((i & 2) >> 1);

  const x = (i & 4) ? a : b;
  const y = (i & 4) ? b : a;

  return [x, y];
};
*/
