import type { ColorSpace, TextureSource } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { bindingToModule, bundleToAttribute, chainTo } from '@use-gpu/shader/wgsl';
import { useContext, useMemo, useNoContext, useNoMemo } from '@use-gpu/live';

import { RenderContext } from '../providers/render-provider';
import { getBoundSource } from '../hooks/useBoundSource';

import { getUIFragment } from '@use-gpu/wgsl/instance/fragment/ui.wgsl';
import { toLinear4, toGamma4 } from '@use-gpu/wgsl/use/gamma.wgsl';

const TEXTURE_BINDING = bundleToAttribute(getUIFragment, 'getTexture');

export const useNativeColorTexture = (
  texture?: ShaderSource,
  filter?: ShaderModule,
) => {
  if (!texture || (texture as any).colorSpace == null || (texture as any).colorSpace === 'native') {
    useNoContext(RenderContext);
    useNoMemo();
    return texture;
  }

  const { colorSpace } = useContext(RenderContext);
  const getTexture = useMemo(() => {
    let getTexture = getBoundSource(TEXTURE_BINDING, texture);
    if (filter) getTexture = chainTo(getTexture, filter);

    const {colorSpace: colorInput} = (texture as any);
    const convert = getNativeColor(colorInput, colorSpace);
    return convert ? chainTo(getTexture, convert) : getTexture;
  }, [texture, filter, colorSpace]);

  return getTexture;
};

export const useNativeColor = (
  colorInput: ColorSpace,
  colorOutput: ColorSpace,
) => {
  return useMemo(() => getNativeColor(colorInput, colorOutput), [colorInput, colorOutput]);
};

export const getNativeColor = (colorInput?: ColorSpace | null, colorOutput?: ColorSpace | null) => {
  if (colorInput === colorOutput) return null;
  if (colorInput === 'native') return null;

  let chain: ShaderModule[] = [];

  if (colorInput  === 'srgb') chain.push(toLinear4);
  if (colorOutput === 'srgb') chain.push(toGamma4);

  if (chain.length === 0) return null;
  if (chain.length === 1) return chain[0];
  return chain.reduce((a, b) => chainTo(a, b));
};
