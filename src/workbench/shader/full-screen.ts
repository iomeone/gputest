import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource, Lazy } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { use, useMemo } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { useRenderContext } from '../providers/render-provider';
import { useShaderRefs } from '../hooks/useShaderRef';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { getShader } from '../hooks/useShader';
import { RawFullScreen } from '../primitives/index';

export type FullScreenProps = {
  texture?: TextureSource,
  shader?: ShaderModule,

  source?: ShaderSource,
  sources?: ShaderSource[],
  args?: Lazy<any>[],

  initial?: boolean,
  history?: boolean | number,
};

const NO_SOURCES: ShaderSource[] = [];

/** Render texture to the current render target, with an optional shader applied.

Provides:
- `@optional @link getTargetSize() -> vec2<f32>`
- `@optional @link getTextureSize() -> vec2<f32>`
- `@optional @link getTexture(uv: vec2<f32>) -> vec4<f32>`

Unnamed arguments are linked in the order of: args, sources, source, history.
*/
export const FullScreen: LiveComponent<FullScreenProps> = (props: FullScreenProps) => {
  const {
    texture,
    shader,
    source,
    sources = NO_SOURCES,
    args = NO_SOURCES,
    initial,
    history,
  } = props;

  const target = useRenderContext();
  const argRefs = useShaderRefs(...args);

  return useMemo(() => {
    let t = texture as any;

    if (shader) {
      const f = history ? (typeof history === 'number'
        ? target.source?.history?.slice(0, history)
        : target.source?.history
      ) ?? NO_SOURCES : NO_SOURCES;
      const s = (source ? [source] : NO_SOURCES).map(s => ((s as any)?.buffer)
        ? getDerivedSource(s as any, {readWrite: false}) : s);

      const bindings = bundleToAttributes(shader);
      const links = {
        getTexture: texture ?? target.source?.history?.[0],
        getTextureSize: () => texture?.size ?? [target.width, target.height],
        getTargetSize: () => [target.width, target.height],
      } as Record<string, any>;

      const allArgs = [...argRefs, ...sources, ...s, ...f];

      const values = bindings.map(b => {
        const k = b.name;
        return links[k] ? links[k] : allArgs.shift();
      });

      t = getShader(shader, values);
    }

    return use(RawFullScreen, {
      texture: t,
      initial,
    });
  }, [shader, texture, target, initial, history, args, source, sources]);
}
