import type { LC, PropsWithChildren, LiveComponent, LiveElement } from '@use-gpu/live';
import type { LightEnv, Renderable } from '../pass';

import { keyed, memo, useMemo } from '@use-gpu/live';
import { makeDepthStencilAttachments } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';

import { useInspectable } from '../hooks/useInspectable'

import { SHADOW_FORMAT } from '../render/light/light-data';

import { ShadowOrthoPass } from './shadow-ortho-pass';
import { ShadowOmniPass } from './shadow-omni-pass';

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
} as Record<string, LiveComponent<any>>;

const label = '<ShadowPass>';
const LABEL = { label };

/** Shadow render pass.

Draws all shadow calls to multiple shadow maps.
*/
export const ShadowPass: LC<ShadowPassProps> = memo((props: ShadowPassProps) => {
  const {
    calls,
    env: {light},
  } = props;

  const inspect = useInspectable();
  const device = useDeviceContext();

  const {shadows, texture} = light;

  const descriptors = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const layers = texture!.size[2];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const attachments = makeDepthStencilAttachments(texture!.texture, SHADOW_FORMAT, layers || 1, 0.0, 'load');
    const descriptors = attachments.map((depthStencilAttachment, i) => ({
      label: `<ShadowPass> Atlas ${i + 1}`,
      colorAttachments: [],
      depthStencilAttachment,
    }));

    return descriptors;
  }, [device, texture]);

  inspect({
    output: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      depth: texture!,
    },
  });

  const out: LiveElement[] = [];
  for (const map of shadows.values()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const Component = SHADOW_TYPES[map.shadow!.type];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (Component) out.push(keyed(Component, map.id, {calls, map, descriptors, texture: texture!}));
  }
  return out;
}, 'ShadowPass');
