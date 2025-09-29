import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { LightEnv, Renderable } from '../pass';

import { keyed, memo, useMemo } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useViewContext } from '../providers/view-provider';

import { useInspectable } from '../hooks/useInspectable'

import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';
import { getRenderPassDescriptor, getDrawOrder } from './util';

import { ShadowOrthoPass } from './shadow-ortho-pass';
import { ShadowOmniPass } from './shadow-omni-pass';

export type ShadowPassProps = {
  env: {
    light: LightEnv,
  },
  calls: {
    shadow?: Renderable[],
  },
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const SHADOW_TYPES = {
  ortho: ShadowOrthoPass,
  omni: ShadowOmniPass,
} as Record<string, LiveComponent<any>>;

/** Shadow render pass.

Draws all shadow calls to multiple shadow maps.
*/
export const ShadowPass: LC<ShadowPassProps> = memo((props: PropsWithChildren<ShadowPassProps>) => {
  const {
    calls,
    env: {light},
  } = props;

  const inspect = useInspectable();
  const device = useDeviceContext();

  const {shadows, texture} = light;

  const descriptors = useMemo(() => {
    const layers = texture.size[2];

    const attachments = makeDepthStencilAttachments(texture.texture, SHADOW_FORMAT, layers || 1, 0.0, 'load');
    const descriptors = attachments.map(depthStencilAttachment => ({
      colorAttachments: [],
      depthStencilAttachment,
    }));

    return descriptors;
  }, [device, texture]);

  inspect({
    output: {
      depth: texture,
    },
  });

  const out: LiveElement[] = [];
  for (const map of shadows.values()) {
    const Component = SHADOW_TYPES[map.shadow!.type];
    if (Component) out.push(keyed(Component, map.id, {calls, map, descriptors, texture}));
  }
  return out;
}, 'ShadowPass');
