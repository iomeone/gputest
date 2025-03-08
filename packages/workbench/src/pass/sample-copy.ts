import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useCallback, useMemo, useOne } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { Update, $delete } from '@use-gpu/state';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';
import renderVirtualSolid from '@use-gpu/wgsl/render/vertex/virtual-solid.wgsl';
import renderFragmentSampleCopy from '@use-gpu/wgsl/render/fragment/sample-copy.wgsl';

import { drawCall } from '../queue/draw-call';

const countGeometry = () => {};
const PIPELINE = {
  depthStencil: {
    depthTest: false,
    depthWriteEnabled: false,
  },
  fragment: {
    targets: {0: { blend: $delete() }},
  },
} as Update<GPURenderPipelineDescriptor>;

export const useSampleCopy = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule | null = null,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {

  const [vertex, fragment] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualSolid, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentSampleCopy, {getSample});

    return [vertexShader, fragmentShader];
  }, [getSample]);

  const blit = drawCall({
    vertexCount: 3,
    instanceCount: 1,
    vertex,
    fragment,
    renderContext,
    globalLayout: layout,
    mode: null,
    pipeline: PIPELINE,
    label: 'useSampleCopy',
  }) as any;

  const draw = useCallback((passEncoder: GPURenderPassEncoder) => {
    if (uv) {
      const x = uv[0] * scale;
      const y = uv[1] * scale;
      const w = (uv[2] - uv[0]) * scale;
      const h = (uv[3] - uv[1]) * scale;

      passEncoder.setViewport(x, y, w, h, 0, 1);
    }

    (blit as any)?.draw && (blit as any).draw(passEncoder, countGeometry);
  }, [blit, uv, scale]);

  return draw;
};
