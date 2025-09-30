import type { TypedArray, UseGPURenderContext } from '../../../core';
import type { ShaderModule } from '../../../shader';

import { useMemo } from '../../../live';
import { bindBundle, getBundleName } from '../../../shader/wgsl';

import { getFullScreenVertex } from '../../../wgsl/instance/vertex/full-screenwgsl';

import renderVirtualCopy from '../../../wgsl/render/vertex/virtual-copywgsl';

import renderFragmentSampleCopy from '../../../wgsl/render/copy/copy-samplewgsl';
import renderFragmentDepthCopy from '../../../wgsl/render/copy/copy-depthwgsl';
import renderFragmentDepthSampleCopy from '../../../wgsl/render/copy/copy-depth-samplewgsl';

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
