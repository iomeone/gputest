import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { bindBundle, getBundleName } from '@use-gpu/shader/wgsl';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';

import renderVirtualCopy from '@use-gpu/wgsl/render/vertex/virtual-copy.wgsl';

import renderFragmentSampleCopy from '@use-gpu/wgsl/render/copy/copy-sample.wgsl';
import renderFragmentDepthCopy from '@use-gpu/wgsl/render/copy/copy-depth.wgsl';
import renderFragmentDepthSampleCopy from '@use-gpu/wgsl/render/copy/copy-depth-sample.wgsl';

import { useRenderCopy } from './render-copy';

export const useCopySample = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  blend?: Partial<GPUBlendState> | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentSampleCopy, {getSample});
    const label = `useCopySample::${getBundleName(getSample)}`;

    return [vertexShader, fragmentShader, label];
  }, [getSample]);

  return useRenderCopy(vertex, fragment, renderContext, false, layout, blend, uv, scale, label);
};

export const useCopyDepth = (
  renderContext: UseGPURenderContext,

  getDepth: ShaderModule | null,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentDepthCopy, {getDepth});
    const label = `useCopyDepth` + (getDepth ? `::${getBundleName(getDepth)}` : '');

    return [vertexShader, fragmentShader, label];
  }, [getDepth]);

  return useRenderCopy(vertex, fragment, renderContext, true, layout, null, uv, scale, label);
};

export const useCopyDepthSample = (
  renderContext: UseGPURenderContext,

  getDepth: ShaderModule,
  getSample: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  blend?: Partial<GPUBlendState> | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentDepthSampleCopy, {getDepth, getSample});
    const label = `useCopyDepthSample::${getBundleName(getSample)}`;

    return [vertexShader, fragmentShader, label];
  }, [getDepth, getSample]);

  return useRenderCopy(vertex, fragment, renderContext, true, layout, blend, uv, scale, label);
};
