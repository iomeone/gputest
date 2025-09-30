import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { extractBindings } from '@use-gpu/shader/wgsl';

import { PassReconciler } from '../reconcilers/index';

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

import lightBinding from '@use-gpu/wgsl/use/light.wgsl';
import shadowBinding from '@use-gpu/wgsl/use/shadow.wgsl';

const {quote} = PassReconciler;

const DEFAULT_PASSES = [
  use(DeferredPass, {}),
];

const NO_BUFFERS: Record<string, UseGPURenderContext[]> = {};

export type DeferredRendererProps = PropsWithChildren<{
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
      solid: {opaque: DeferredSolidRender, transparent: SolidRender},
      shaded: {opaque: DeferredShadedRender, transparent: ShadedRender},
      ui: {opaque: DeferredUIRender, transparent: UIRender},
      ...renders,
    }
  }
};

export const DeferredRenderer: LC<DeferredRendererProps> = memo((props: DeferredRendererProps) => {
  const {
    overlay = false,
    merge = false,
    passes = DEFAULT_PASSES,
    buffers = NO_BUFFERS,
    context,
    children,
  } = props;

  const shadows = !!buffers.shadow;
  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Provide forward-lit material + emit deferred light draw calls
  const view = use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) =>
      useMemo(() => quote([
        yeet({ env: { light }}),
        use(LightRender, {...light, shadows}),
      ]), [light, shadows]),
  });

  // Prepare bind group layout for lighting/shadows
  const entries = useMemo(() => {
    const vertex   = [lightBinding];
    const fragment = [lightBinding, shadows && shadowBinding];
    return extractBindings([vertex, fragment], 'PASS');
  }, [shadows]);

  return Renderer({ buffers, context, children: view, components, passes, entries, overlay, merge });
}, 'DeferredRenderer');
