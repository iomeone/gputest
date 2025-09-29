import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, RenderComponents } from '../pass/types';

import { use, yeet, memo, useOne } from '@use-gpu/live';

import { DebugRender } from './forward/debug';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { PickingRender } from './forward/picking';
import { UIRender } from './forward/ui';

import { ColorPass } from '../pass/color-pass';

import { Renderer } from './renderer';
import { LightMaterial } from './light/light-material';

const DEFAULT_PASSES = [
  use(ColorPass, {}),
];

const NO_BUFFERS: Record<string, UseGPURenderContext[]> = {};

export type ForwardRendererProps = {
  lights?: boolean,
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
      solid: {opaque: SolidRender, transparent: SolidRender},
      shaded: {opaque: ShadedRender, transparent: ShadedRender},
      ui: {opaque: UIRender, transparent: UIRender},
      ...renders,
    }
  }
};

export const ForwardRenderer: LC<ForwardRendererProps> = memo((props: PropsWithChildren<ForwardRendererProps>) => {
  const {
    lights = false,
    overlay = false,
    merge = false,
    passes = DEFAULT_PASSES,
    buffers = NO_BUFFERS,
    children,
  } = props;

  const shadows = !!buffers.shadow;
  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Provide forward-lit material
  const view = lights ? use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) => 
      useOne(() => yeet({ env: { light }}), light),
  }) : children;

  return Renderer({ buffers, children: view, components, passes, lights, overlay, merge });
}, 'ForwardRenderer');
