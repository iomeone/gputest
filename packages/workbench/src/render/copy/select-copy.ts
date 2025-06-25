import type { TypedArray, UseGPURenderContext } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { bindBundle, getBundleName } from '@use-gpu/shader/wgsl';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';

import renderVirtualCopy from '@use-gpu/wgsl/render/vertex/virtual-copy.wgsl';

import renderFragmentSelectSampleCopy2 from '@use-gpu/wgsl/render/copy/copy-select-sample-2.wgsl';
import renderFragmentSelectDepthSampleCopy from '@use-gpu/wgsl/render/copy/copy-select-depth-sample.wgsl';
import renderFragmentSelectDepthSampleCopy2 from '@use-gpu/wgsl/render/copy/copy-select-depth-sample-2.wgsl';

import { useRenderCopy } from './render-copy';

export const useCopySelectSample2 = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectA: ShaderModule,
  selectB: ShaderModule,

  layout?: GPUBindGroupLayout | null,

  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentSelectSampleCopy2, {getSample, selectA, selectB});
    const label = `useCopySelectSample2` +
      `::${getBundleName(getSample)}::${getBundleName(selectA)}::${getBundleName(selectB)}`;

    return [vertexShader, fragmentShader, label];
  }, [getSample, selectA, selectB]);

  return useRenderCopy(vertex, fragment, renderContext, false, layout, uv, scale, label);
};

export const useCopySelectDepthSample = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectDepth: ShaderModule,
  selectSample: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentSelectDepthSampleCopy, {getSample, selectDepth, selectSample});
    const label = `useCopySelectDepthSample` +
      `::${getBundleName(getSample)}::${getBundleName(selectDepth)}::${getBundleName(selectSample)}`;

    return [vertexShader, fragmentShader, label];
  }, [getSample, selectDepth, selectSample]);

  return useRenderCopy(vertex, fragment, renderContext, true, layout, uv, scale, label);
};

export const useCopySelectDepthSample2 = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectDepth: ShaderModule,
  selectA: ShaderModule,
  selectB: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  uv?: TypedArray | number[],
  scale: number = 1,
) => {
  const [vertex, fragment, label] = useMemo(() => {
    const vertexShader = bindBundle(renderVirtualCopy, {getVertex: getFullScreenVertex});
    const fragmentShader = bindBundle(renderFragmentSelectDepthSampleCopy2, {getSample, selectDepth, selectA, selectB});
    const label = `useCopySelectDepthSample2` +
      `::${getBundleName(getSample)}::${getBundleName(selectDepth)}::${getBundleName(selectA)}::${getBundleName(selectB)}`;

    return [vertexShader, fragmentShader, label];
  }, [getSample, selectDepth, selectA, selectB]);

  return useRenderCopy(vertex, fragment, renderContext, true, layout, uv, scale, label);
};
