import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { extractBindings } from '@use-gpu/shader/wgsl';

import { PassReconciler } from '../reconcilers/index';

import { DebugRender } from './forward/debug';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { PickingRender } from './forward/picking';
import { UIRender } from './forward/ui';

import { ColorPass } from '../pass/color-pass';

import { Renderer } from './renderer';
import { LightMaterial } from './light/light-material';

import lightBinding from '@use-gpu/wgsl/use/light.wgsl';
import shadowBinding from '@use-gpu/wgsl/use/shadow.wgsl';

const {quote} = PassReconciler;

const DEFAULT_PASSES = [
  use(ColorPass, {}),
];

const NO_BUFFERS: Record<string, UseGPURenderContext[]> = {};

export type ForwardRendererProps = PropsWithChildren<{
  lights?: boolean,
  overlay?: boolean,
  merge?: boolean,

  buffers?: Record<string, UseGPURenderContext[]>,
  context?: Record<string, any>,
  passes?: LiveElement[],
  components?: RenderComponents,
}>;

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

export const ForwardRenderer: LC<ForwardRendererProps> = memo((props: ForwardRendererProps) => {
  const {
    lights = false,
    overlay = false,
    merge = false,
    passes = DEFAULT_PASSES,
    buffers = NO_BUFFERS,
    context,
    children,
  } = props;

  const shadows = !!buffers.shadow;
  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Provide forward-lit material
  const view = lights ? use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) =>
      useOne(() => quote(yeet({ env: { light }})), light),
  }) : children;

  // Prepare bind group layout for lighting/shadows
  const entries = useMemo(() => {
    const vertex   = [lights && lightBinding];
    const fragment = [lights && lightBinding, shadows && shadowBinding];
    return extractBindings([vertex, fragment], 'PASS');
  }, [lights, shadows]);

  return Renderer({ buffers, context, children: view, components, passes, entries, overlay, merge });
}, 'ForwardRenderer');
