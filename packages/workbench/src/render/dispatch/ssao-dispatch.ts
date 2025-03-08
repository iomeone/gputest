import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/shader';

import { yeet, useOne, useRef } from '@use-gpu/live';

import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';
import { useKeyboard, useMouse, useNoKeyboard, useNoMouse } from '../../providers/event-provider';

import { useRawTextureAccess } from '../../hooks/useRawTextureAccess';
import { useSource } from '../../hooks/useSource';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDebugContext } from '../../providers/debug-provider';
import { usePrintContext, useNoPrintContext } from '../../providers/print-provider';

import { useDepthCopy } from '../../pass/depth-copy';
import { useSampleCopy } from '../../pass/sample-copy';

import { getMotionSample } from '@use-gpu/wgsl/motion/motion-sample.wgsl';

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

  mode: 'normal' | 'motion' | 'sample' | 'accum' | 'resolve',
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

  const [normalTarget, motionTarget, sampleTarget, accumTarget, resolveTarget] = ssao;
  const {width, height, pixelRatio} = normalTarget;

  const {ssao: ssaoDebug} = useDebugContext();

  const frame = useRef(0);
  const size = useShaderRef([width, height]);

  // Debug viz
  const hasDebugPicking = !!ssaoDebug?.pickAO;
  let shouldPick = false;
  let shouldClear = false;
  let debugArgs = NO_DEBUG_ARGS;
  let swapBuffer = null;
  if (hasDebugPicking) {
    const {swap, shaders: {printPoint, printLine, printData}} = usePrintContext();
    const {keyboard} = useKeyboard();
    const {mouse} = useMouse();

    shouldPick = keyboard.keys.alt;
    shouldClear = shouldPick && !keyboard.keys.shift;
    swapBuffer = shouldClear ? swap : null;

    const pick = useShaderRef([shouldPick ? mouse.x / 2 * pixelRatio : -1, shouldPick ? mouse.y / 2 * pixelRatio : -1]);    
    debugArgs = [pick, printPoint, printLine, printData];
  }
  else {
    useNoPrintContext();
    useNoKeyboard();
    useNoMouse();
  }

  const downscaleOffset = () => getResampleOffset(normalContext.source.size, normalTarget.source.size, frame.current);

  let draw;
  if (mode === 'normal') {
    const getNormal16 = useRawTextureAccess(normalContext.source, downscaleOffset).shader;
    const getDepth = useRawTextureAccess(normalContext.depth, downscaleOffset).shader;

    draw = useDepthCopy(targetContext, getDepth, getNormal16, globalLayout);
  }
  else if (mode === 'motion') {
    const getMotion = useRawTextureAccess(motionContext.source, downscaleOffset).shader;

    draw = useSampleCopy(targetContext, getMotion, globalLayout);
  }
  else if (mode === 'sample') {
    const r = useShaderRef(radius);
    const defs = useOne(() => ({ HAS_DEBUG_PICKING: hasDebugPicking }))

    const getNormal16 = useRawTextureAccess(normalTarget.source);
    const getDepth = useRawTextureAccess(normalTarget.depth);
    const getSample = useShader(getSSAOSample, [getNormal16, getDepth, r, size, frame, ...debugArgs], defs);

    draw = useSampleCopy(targetContext, getSample, globalLayout);
  }
  else if (mode === 'accum') {

    const getNormal16 = useRawTextureAccess(normalTarget.source);
    const getDepth = useRawTextureAccess(normalTarget.depth);

    const getSample = useRawTextureAccess(sampleTarget.source);
    const getMotion = useRawTextureAccess(motionTarget.source);
    const getLastAccum = accumTarget.source.history![0];
    const getAccum = useShader(getSSAOAccum, [getNormal16, getDepth, getSample, getMotion, getLastAccum, size, frame, debugArgs?.[3]]);

    draw = useSampleCopy(targetContext, getAccum, globalLayout);
  }
  else if (mode === 'resolve') {

    const getSample = accumTarget.source;
    const getResolve = useShader(getSSAOResolve, [getSample]);

    draw = useSampleCopy(targetContext, getResolve, globalLayout);
  }

  if (!draw) return null;

  const command = (commandEncoder: GPUCommandEncoder) => {
    if (mode === 'accum') swapBuffer?.();
    targetContext?.swap();

    const passEncoder = commandEncoder.beginRenderPass(descriptor);
    bindPass?.(passEncoder);
    frame.current = (frame.current + 1) % 0xffff;
    draw(passEncoder);
    passEncoder.end();
  };

  return yeet({ ssao: command });
};

const getResampleOffset = (fromSize: VectorLike, toSize: VectorLike, jitter: number) => {
  const i = jitter & 0x3;
  const x = (i & 1);
  const y = (i & 1) ^ ((i & 2) >> 1);

  const [w1, h1] = fromSize;
  const [w2, h2] = toSize;
  
  return [(.5+x)/w1 + -.5/w2, (.5+y)/h1 - .5/h2];
};
