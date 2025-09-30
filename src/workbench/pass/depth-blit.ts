import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useCallback, useOne } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';
import instanceDrawVirtualDepth from '@use-gpu/wgsl/render/vertex/virtual-depth.wgsl';
import instanceFragmentDepthCopy from '@use-gpu/wgsl/render/fragment/depth-copy.wgsl';

import { drawCall } from '../queue/draw-call';

const countGeometry = () => {};
const PIPELINE = {
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: 'always',
  },
} as Partial<GPURenderPipelineDescriptor>;

export const useDepthBlit = (
  renderContext: UseGPURenderContext,
  descriptor: GPURenderPassDescriptor,
  uv?: TypedArray | number[],
  scale: number = 1,

  getSample: ShaderModule | null = null,
) => {

  const [vertex, fragment] = useOne(() => {
    const vertexShader = bindBundle(instanceDrawVirtualDepth, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(instanceFragmentDepthCopy, {getDepth: getSample});

    return [vertexShader, fragmentShader];
  }, getSample);

  const blit = drawCall({
    vertexCount: 3,
    instanceCount: 1,
    vertex,
    fragment,
    renderContext,
    mode: null,
    pipeline: PIPELINE,
  }) as any;

  const draw = useCallback((commandEncoder: GPUCommandEncoder) => {
    const passEncoder = commandEncoder.beginRenderPass(descriptor);

    if (uv) {
      const x = uv[0] * scale;
      const y = uv[1] * scale;
      const w = (uv[2] - uv[0]) * scale;
      const h = (uv[3] - uv[1]) * scale;

      passEncoder.setViewport(x, y, w, h, 0, 1);
    }

    (blit as any)?.draw && (blit as any).draw(passEncoder, countGeometry);

    passEncoder.end();
  }, [blit, uv, descriptor]);

  return draw;
};
