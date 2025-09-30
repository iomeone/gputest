import type { ColorSpace } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { bundleToAttribute } from '@use-gpu/shader/wgsl';
import { useContext, useMemo, useNoContext, useNoMemo } from '@use-gpu/live';
import { chainTo } from '@use-gpu/shader/wgsl';

import { RenderContext } from '../providers/render-provider';
import { getSource } from '../hooks/useSource';

import { getSDFRectangleFragment } from '@use-gpu/wgsl/instance/fragment/sdf-rectangle.wgsl';
import { toLinear4, toGamma4 } from '@use-gpu/wgsl/use/gamma.wgsl';

const TEXTURE_BINDING = bundleToAttribute(getSDFRectangleFragment, 'getTexture');

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
    let getTexture = getSource(TEXTURE_BINDING, texture);
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

  const chain: ShaderModule[] = [];

  if (colorInput  === 'srgb') chain.push(toLinear4);
  if (colorOutput === 'srgb') chain.push(toGamma4);

  if (chain.length === 0) return null;
  if (chain.length === 1) return chain[0];
  return chain.reduce((a, b) => chainTo(a, b));
};
