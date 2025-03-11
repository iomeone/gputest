import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useCallback, useMemo, useOne } from '@use-gpu/live';
import { bindBundle, getBundleName } from '@use-gpu/shader/wgsl';

import { Update, $delete } from '@use-gpu/state';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';

import renderVirtualDepth from '@use-gpu/wgsl/render/vertex/virtual-depth.wgsl';
import renderFragmentDepthCopy from '@use-gpu/wgsl/render/fragment/copy-depth.wgsl';
import renderFragmentDepthSampleCopy from '@use-gpu/wgsl/render/fragment/copy-depth-sample.wgsl';
import renderFragmentDepthSampleCopy2 from '@use-gpu/wgsl/render/fragment/copy-depth-sample-2.wgsl';

import { drawCall } from '../queue/draw-call';

const countGeometry = () => {};
const PIPELINE = {
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: 'always',
  },
  fragment: {
    targets: {0: { blend: $delete() }},
  },
} as Update<GPURenderPipelineDescriptor>;

export const useDepthCopy = (
  renderContext: UseGPURenderContext,

  getDepth: ShaderModule | null = null,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => useDepthSampleCopy(renderContext, getDepth, null, layout, uv, scale);

export const useDepthSampleCopy = (
  renderContext: UseGPURenderContext,

  getDepth: ShaderModule | null = null,
  getSample: ShaderModule | null = null,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {

  const [vertex, fragment] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualDepth, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(
      getSample ? renderFragmentDepthSampleCopy : renderFragmentDepthCopy,
      {getDepth, getSample}
    );

    return [vertexShader, fragmentShader];
  }, [getDepth, getSample]);

  const blit = drawCall({
    vertexCount: 3,
    instanceCount: 1,
    vertex,
    fragment,
    renderContext,
    globalLayout: layout,
    mode: null,
    pipeline: PIPELINE,
    label: `useDepthSampleCopy` + (getDepth ? `::${getBundleName(getDepth)}` : '') + (getSample ? `::${getBundleName(getSample)}` : ''),
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

export const useDepthSampleCopy2 = (
  renderContext: UseGPURenderContext,

  getDepth: ShaderModule | null = null,
  getSample: ShaderModule,
  selectA: ShaderModule,
  selectB: ShaderModule,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {

  const [vertex, fragment] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualDepth, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentDepthSampleCopy2, {getDepth, getSample, selectA, selectB});

    return [vertexShader, fragmentShader];
  }, [getDepth, getSample]);

  const blit = drawCall({
    vertexCount: 3,
    instanceCount: 1,
    vertex,
    fragment,
    renderContext,
    globalLayout: layout,
    mode: null,
    pipeline: PIPELINE,
    label: `useDepthSampleCopy2` +
      (getDepth ? `::${getBundleName(getDepth)}` : '') +
      `::${getBundleName(getSample)}::${getBundleName(selectA)}::${getBundleName(selectB)}`,
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
