import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TextureSource, LambdaSource, Lazy } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';

import { useShaderRefs } from '../hooks/useShaderRef';
import { useLambdaSource } from '../hooks/useLambdaSource';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { getShader } from '../hooks/useShader';
import { useRenderProp } from '../hooks/useRenderProp';

export type TextureShaderProps = {
  texture: TextureSource,
  shader: ShaderModule,

  source?: ShaderSource,
  sources?: ShaderSource[],
  args?: Lazy<any>[],

  render?: (source: LambdaSource) => LiveElement,
  children?: (source: LambdaSource) => LiveElement,
};

const NO_SOURCES: ShaderSource[] = [];
const NO_SOURCE = { length: 0, size: [0] };

/** Texture shader for custom UV sampling of a 2D input texture.

Provides:
- `@optional @link fn getTextureSize() -> vec2<f32>`
- `@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32>`

Unnamed arguments are linked in the order of: args, sources, source.
*/
export const TextureShader: LiveComponent<TextureShaderProps> = (props) => {
  const {
    texture,
    shader,
    source,
    sources = NO_SOURCES,
    args = NO_SOURCES,
  } = props;

  const argRefs = useShaderRefs(...args);

  const getTexture = useMemo(() => {
    const s = (source ? [source] : NO_SOURCES).map(s => ((s as any)?.buffer)
      ? getDerivedSource(s as any, {readWrite: false}) : s);

    const bindings = bundleToAttributes(shader);
    const links = {
      getTexture: texture,
      getTextureSize: () => texture.size,
    } as Record<string, any>;

    const allArgs = [...argRefs, ...sources, ...s];

    const values = bindings.map(b => {
      const k = b.name;
      return links[k] ? links[k] : allArgs.shift();
    });

    return getShader(shader, values);
  }, [shader, texture, args.length, source, sources]);

  const output = useLambdaSource(getTexture, texture ?? source ?? NO_SOURCE);

  return useRenderProp(props, output);
};
