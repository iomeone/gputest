import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TextureSource, UniformAttributeValue } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { yeet, useMemo } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { getBoundSource } from '../hooks/useBoundSource';

import { RenderContext } from '../providers/render-provider';

import { toGamma4 } from '@use-gpu/wgsl/use/gamma.wgsl';

export type TextureShaderProps = {
  shader?: ShaderModule,
  texture?: TextureSource,
  render?: (source: ShaderModule) => LiveElement<any>,
};

const TEXTURE_BINDING = { name: 'getTexture', format: 'vec4<f32>', args: ['vec2<f32>'], value: [0, 0, 0, 0] } as UniformAttributeValue;

export const TextureShader: LiveComponent<TextureShaderProps> = (props) => {
  const {
    shader,
    texture,
    render,
  } = props;

  const inputTexture = useNativeColorTexture(texture);
  
  const getTexture = useMemo(() => {
    const source = getBoundSource(TEXTURE_BINDING, texture);
    return shader ? bindBundle(shader, {
      getTexture: source
    }) : source;
  }, [shader, texture]);

  return useMemo(() => render ? render(getTexture) : yeet(getTexture), [render, getTexture]);
};
