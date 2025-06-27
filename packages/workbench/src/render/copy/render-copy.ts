import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { Update } from '@use-gpu/state';
import type { Renderable } from '../../pass/types';

import { useCallback } from '@use-gpu/live';
import { $patch, $delete } from '@use-gpu/state';

import { drawCall } from '../../queue/draw-call';

const countGeometry = () => {};

const getCopyPipeline = (depth: boolean, blend: GPUBlendState) => {
  if (depth) return {
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'always',
    },
    fragment: {
      targets: $patch(ts => [...ts].reduce((op, _, i) => {
        op[i] = {blend: blend ?? $delete()};
        return op;
      }, {} as Record<number, Update<any>>)),
    },
  } as Update<GPURenderPipelineDescriptor>;

  return {
    depthStencil: {
      depthWriteEnabled: false,
      depthCompare: 'always',
    },
    fragment: {
      targets: $patch(ts => [...ts].reduce((op, _, i) => {
        op[i] = {blend: blend ?? $delete()};
        return op;
      }, {} as Record<number, Update<any>>)),
    },
  } as Update<GPURenderPipelineDescriptor>;
};

export const useRenderCopy = (
  vertex: ShaderModule,
  fragment: ShaderModule | null = null,

  renderContext: UseGPURenderContext,
  depth?: boolean,

  layout?: GPUBindGroupLayout | null,
  blend?: GPUBlendState | null,

  uv?: TypedArray | number[],
  scale: number = 1,

  label?: string,
) => {
  const blit = drawCall({
    vertexCount: 3,
    instanceCount: 1,
    vertex,
    fragment,
    renderContext,
    globalLayout: layout,
    mode: null,
    pipeline: getCopyPipeline(depth, blend),
    label,
  }) as (Renderable | undefined);

  const draw = useCallback((passEncoder: GPURenderPassEncoder) => {
    if (uv) {
      const x = uv[0] * scale;
      const y = uv[1] * scale;
      const w = (uv[2] - uv[0]) * scale;
      const h = (uv[3] - uv[1]) * scale;

      passEncoder.setViewport(x, y, w, h, 0, 1);
    }

    (blit?.draw as any)?.(passEncoder, countGeometry);
  }, [blit, uv, scale]);

  return draw;
};
