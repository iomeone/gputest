import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '../../live';
import type { LightEnv, Renderable } from '../pass';

import { keyed, memo, useMemo } from '../../live';
import { makeDepthStencilAttachments } from '../../core';

import { useInspectable } from '../hooks/useInspectable'

import { SHADOW_FORMAT } from '../render/light/light-data';

import { ShadowOrthoPass } from './shadow-ortho-pass';
import { ShadowOmniPass } from './shadow-omni-pass';
import { ShadowHemiPass } from './shadow-hemi-pass';
import { ShadowSpotPass } from './shadow-spot-pass';

export type ShadowPassProps = PropsWithChildren<{
  env: {
    light: LightEnv,
  },
  calls: {
    shadow?: Renderable[],
  },
}>;

const SHADOW_TYPES = {
  ortho: ShadowOrthoPass,
  omni: ShadowOmniPass,
  hemi: ShadowHemiPass,
  spot: ShadowSpotPass,
} as Record<string, LiveComponent<any>>;

/** Shadow render pass.

Draws all shadow calls to multiple shadow maps.
*/
export const ShadowPass: LC<ShadowPassProps> = memo((props: ShadowPassProps) => {
  const {
    calls,
    env,
    env: {light},
  } = props;

  const inspect = useInspectable();

  const {shadows, sources: {shadowMap: texture}} = light;
  if (!texture) return null;

  const descriptors = useMemo(() => {
    const layers = texture.size[2];

    const attachments = makeDepthStencilAttachments(texture.texture, SHADOW_FORMAT, layers || 1, 0.0, 'load');
    const descriptors = attachments.map((depthStencilAttachment, i) => ({
      label: `<ShadowPass> Atlas #${i + 1}`,
      colorAttachments: [],
      depthStencilAttachment,
    }));

    return descriptors;
  }, [texture]);

  inspect({
    output: {
      source: texture,
    },
  });

  const out: LiveElement[] = [];
  for (const map of shadows.values()) if (map.shadow) {
    const Component = SHADOW_TYPES[map.shadow.type];
    if (Component) out.push(keyed(Component, map.id, {env, calls, map, descriptors, texture}));
  }
  return out;
}, 'ShadowPass');
