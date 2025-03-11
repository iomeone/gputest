import type { Update } from '@use-gpu/state';
import type { Blending, Side } from '@use-gpu/core';
import { makeBlendState } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';
import { $set, $delete } from '@use-gpu/state';
import { useRenderContext } from '../providers/render-provider';

export type PipelineOptions = {
  mode: string,
  blend: Blending | GPUBlendState | null,
  side: Side,
  shadow: boolean,
  scissor: any,
  depthWrite: boolean,
  depthTest: boolean,
  alphaToCoverage: boolean,
  alphaToDiscard: boolean,
  topology: GPUPrimitiveTopology,
  stripIndexFormat: any,
};

const CULL_SIDE = {
  front: 'back',
  back: 'front',
  both: 'none',
} as Record<string, GPUCullMode>;

export const usePipelineOptions = (
  options: Partial<PipelineOptions>,
): [
  Update<GPURenderPipelineDescriptor>,
  Record<string, any>,
] => {
  const {samples} = useRenderContext();

  const {
    shadow = null,
    scissor = null,
    mode = 'opaque',
    topology = 'triangle-list',
    stripIndexFormat = undefined,
    side = 'both',
    depthTest = null,
    depthWrite = null,
    alphaToCoverage = false,
    alphaToDiscard = true,
    blend = (
      (alphaToCoverage && samples === 1) ? 'premultiply' :
      (!alphaToCoverage && mode === 'transparent') ? 'premultiply' : 'none'
    ),
  } = options;


  const pipeline = useMemo(() => {
    const primitive = {
      topology: topology,
      cullMode: CULL_SIDE[side],
      stripIndexFormat,
    };

    const multisample = {
      alphaToCoverageEnabled: alphaToCoverage && samples > 1,
    };

    const fragment = {
      targets: {
        0: {blend: makeBlendState(blend) ?? $delete()},
      } as any
    };

    const depthStencil = {
      depthWriteEnabled: depthWrite != null ? depthWrite : undefined,
      depthCompare: depthTest === false ? 'always' as GPUCompareFunction : undefined,
    };

    return {primitive, multisample, fragment, depthStencil};
  }, [
    topology,
    stripIndexFormat,
    side,
    depthTest,
    depthWrite,
    alphaToCoverage,
    blend,
    samples,
  ]);

  const defs = useMemo(() => ({
    HAS_ALPHA_TO_COVERAGE: alphaToCoverage && samples > 1,
    HAS_ALPHA_TO_DISCARD: alphaToDiscard,
    HAS_SCISSOR: !!scissor,
    HAS_SHADOW: !!shadow,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [alphaToCoverage, alphaToDiscard, samples, !!scissor, !!shadow]);

  return [pipeline, defs];
};
