import type { TypedArray, UseGPURenderContext } from '../../../core';
import type { ShaderModule } from '../../../shader';

import { useMemo } from '../../../live';
import { bindBundle, getBundleName } from '../../../shader/wgsl';

import { getFullScreenVertex } from '../../../wgsl/instance/vertex/full-screenwgsl';

import renderVirtualCopy from '../../../wgsl/render/vertex/virtual-copywgsl';

import renderFragmentSelectSampleCopy2 from '../../../wgsl/render/copy/copy-select-sample-2wgsl';
import renderFragmentSelectDepthSampleCopy from '../../../wgsl/render/copy/copy-select-depth-samplewgsl';
import renderFragmentSelectDepthSampleCopy2 from '../../../wgsl/render/copy/copy-select-depth-sample-2wgsl';

import { useRenderCopy } from './render-copy';

export const useCopySelectSample2 = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectA: ShaderModule,
  selectB: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  blend?: GPUBlendState | null,

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

  return useRenderCopy(vertex, fragment, renderContext, false, layout, blend, uv, scale, label);
};

export const useCopySelectDepthSample = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectDepth: ShaderModule,
  selectSample: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  blend?: GPUBlendState | null,

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

  return useRenderCopy(vertex, fragment, renderContext, true, layout, blend, uv, scale, label);
};

export const useCopySelectDepthSample2 = (
  renderContext: UseGPURenderContext,

  getSample: ShaderModule,
  selectDepth: ShaderModule,
  selectA: ShaderModule,
  selectB: ShaderModule,

  layout?: GPUBindGroupLayout | null,
  blend?: GPUBlendState | null,

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

  return useRenderCopy(vertex, fragment, renderContext, true, layout, blend, uv, scale, label);
};
