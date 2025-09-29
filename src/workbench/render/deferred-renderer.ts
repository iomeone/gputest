import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, RenderComponents, VirtualDraw } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { DebugRender } from './forward/debug';
import { PickingRender } from './forward/picking';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { UIRender } from './forward/ui';

import { DeferredPass } from '../pass/deferred-pass';

import { DeferredShadedRender } from './deferred/shaded';
import { DeferredSolidRender } from './deferred/solid';
import { DeferredUIRender } from './deferred/ui';

import { Renderer } from './renderer';
import { LightRender } from './light/light';
import { LightMaterial } from './light/light-material';

const DEFAULT_PASSES = [
  use(DeferredPass, {}),
];

const NO_BUFFERS: Record<string, UseGPURenderContext[]> = {};

export type DeferredRendererProps = {
  overlay?: boolean,
  merge?: boolean,

  buffers?: Record<string, UseGPURenderContext[]>,
  passes?: LiveElement[],
  components?: RenderComponents,
};

const getComponents = ({modes = {}, renders = {}}: Partial<RenderComponents>): RenderComponents => {
  return {
    modes: {
      debug: DebugRender,
      picking: PickingRender,
      shadow: ShadowRender,
      ...modes,
    },
    renders: {
      solid: {opaque: DeferredSolidRender, transparent: SolidRender},
      shaded: {opaque: DeferredShadedRender, transparent: ShadedRender},
      ui: {opaque: DeferredUIRender, transparent: UIRender},
      ...renders,
    }
  }
};

const HOVERED_VARIANT = 'debug';

export const DeferredRenderer: LC<DeferredRendererProps> = memo((props: PropsWithChildren<DeferredRendererProps>) => {
  const {
    overlay = false,
    merge = false,
    passes = DEFAULT_PASSES,
    buffers = NO_BUFFERS,
    children,
  } = props;

  const shadows = !!buffers.shadow;
  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Provide forward-lit material + emit deferred light draw calls
  const view = use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) => 
      useMemo(() => [
        yeet({ env: { light }}),
        use(LightRender, {...light, shadows}),
      ], [light, shadows]),
  });

  return Renderer({ buffers, children: view, components, passes, lights: true, overlay, merge });
}, 'DeferredRenderer');
