import type { LiveComponent, Ref } from '@use-gpu/live';
import type { OffscreenTarget, UseGPURenderContext, VectorLike } from '@use-gpu/core';

import { yeet, useMemo, useOne, useRef } from '@use-gpu/live';
import { chainTo } from '@use-gpu/shader/wgsl';

import { usePassContext } from '../../providers/pass-provider';
import { useKeyboardState, useMouseState } from '../../providers/event-provider';

import { useTextureAccess, useTextureUVToXY } from '../../hooks/useTextureAccess';
import { useShader } from '../../hooks/useShader';
import { useShaderRef } from '../../hooks/useShaderRef';

import { useDebugContext } from '../../providers/debug-provider';
import { usePrintContext, useNoPrintContext } from '../../providers/print-provider';

import { useCopySample, useCopyDepthSample } from '../copy/value-copy';

import { downsampleExact2 } from '@use-gpu/wgsl/texture/downsample.wgsl';

import { getOutlineSample } from '@use-gpu/wgsl/outline/outline-sample.wgsl';
import { getOutlineResolve } from '@use-gpu/wgsl/outline/outline-resolve.wgsl';

import { decodeNormal16, octaToNormal, octaToNormal16 } from '@use-gpu/wgsl/codec/normal16.wgsl';

export type OutlineDispatchProps = {
  bindPass?: (r: GPURenderPassEncoder) => void,
  globalLayout?: GPUBindGroupLayout,

  mode: 'edge' | 'resolve',

  inner: number,
  outer: number,
  color: VectorLike,

  depthRamp: number,
  normalRamp: number,

  targetContext: UseGPURenderContext,
  descriptor: GPURenderPassDescriptor,
};

export const OutlineDispatch: LiveComponent<OutlineDispatchProps> = (props: OutlineDispatchProps) => {
  const {
    bindPass,
    globalLayout,

    mode, // static

    inner,
    outer,
    color,

    depthRamp,
    normalRamp,

    targetContext,
    descriptor,
  } = props;

  const {
    buffers: {normal, outline},
    views: { pre: { uniforms: { overscanMatrix }}},
  } = usePassContext();

  const [normalContext] = normal;

  const [edgeTarget] = outline as OffscreenTarget[];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalContextDepth = normalContext.depth!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const normalContextSource = normalContext.source!;

  const frame = useRef(0);

  const overscanSize = useShaderRef([normalContext.width, normalContext.height]);
  const targetSize = useShaderRef([edgeTarget.width, edgeTarget.height]);

  const m = overscanMatrix?.current;
  const overscanScale = useShaderRef([m?.[0] ?? 1, m?.[5] ?? 1]);

  const {current: os} = overscanSize;

  const innerRadius = useShaderRef(inner);
  const outerRadius = useShaderRef(outer);
  const outlineColor = useShaderRef(color);

  const edgeWeights = useMemo(() => ({DEPTH_RAMP: depthRamp, NORMAL_RAMP: normalRamp}), [depthRamp, normalRamp]);

  type Draw = (r: GPURenderPassEncoder) => void;
  let draw: Draw | null = null;
  if (mode === 'edge') {
    const loadSourceDepth = useTextureAccess(normalContextDepth);

    const {format} = normalContextSource;
    const loadSourceNormal = useTextureAccess(normalContextSource).shader;
    const loadSourceNormal16 = useMemo(() => {
      if (format.match(/uint/)) return loadSourceNormal;
      return chainTo(loadSourceNormal, octaToNormal16);
    }, [format, loadSourceNormal]);

    const defs = edgeWeights;
    const getSample = useShader(getOutlineSample, [
      loadSourceNormal16,
      loadSourceDepth,
      overscanSize,
      overscanScale,
    ], defs);

    draw = useCopySample(targetContext, getSample, globalLayout);
  }
  if (mode === 'resolve') {
    const loadEdge = useTextureAccess(edgeTarget.source);

    const getSample = useShader(getOutlineResolve, [
      loadEdge,
      targetSize,
      innerRadius,
      outerRadius,
      outlineColor,
    ]);

    draw = useCopySample(targetContext, getSample, globalLayout, {});
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

  return yeet({ outline: command });
};
