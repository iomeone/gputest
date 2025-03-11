import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, PassFlags, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { PassReconciler } from '../reconcilers/index';

import { DebugRender } from './forward/debug';
import { PickingRender } from './forward/picking';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { UIRender } from './forward/ui';

import { useStandardBindGroups } from '../pass/bindings';
import { useMakeUseVariants } from '../pass/variants';

import { DebugPass } from '../pass/debug-pass';
import { DeferredPass } from '../pass/deferred-pass';
import { PickingPass } from '../pass/picking-pass';
import { ShadowPass } from '../pass/shadow-pass';

import { DeferredShadedRender } from './deferred/deferred-shaded';
import { DeferredSolidRender } from './deferred/deferred-solid';
import { DeferredUIRender } from './deferred/deferred-ui';

import { Renderer } from './renderer';
import { LightRender } from './light/light-render';
import { LightMaterial } from './light/light-material';

const {quote} = PassReconciler;

const NO_RESOURCES: PassResources = {
  buffers: {},
  bindings: {},
};

const NO_OPTIONS: DeferredRendererOptions = {};

export type DeferredRendererOptions = Pick<PassFlags, 'shadows' | 'merge' | 'overlay'>;

export type DeferredRendererProps = PropsWithChildren<{
  buffers?: Record<string, UseGPURenderContext[]>,
  options?: DeferredRendererOptions,
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

/** Deferred-mode rendering with a G-Buffer. Lights are painted in afterwards using stencil volumes. */
export const DeferredRenderer: LC<DeferredRendererProps> = memo((props: DeferredRendererProps) => {
  const {
    resources = NO_RESOURCES,
    options = NO_OPTIONS,
    passes,

    children,
  } = props;

  const {buffers} = resources;

  const {
    lights = false,
    overlay = false,
    merge = false,
    debug = null,
  
    shadows = !!buffers.shadow,
    picking = !!buffers.picking,
  } = options;

  const flags = useMemo(() => ({
    lights,
    overlay,
    merge,
  
    shadows,
    picking,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [options, buffers]);

  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Prepare passes
  const resolved = useOne(() => passes ?? [
    shadows ? use(ShadowPass, options) : null,
    use(DeferredPass, options),
    picking ? use(PickingPass, options) : null, 
    debug ? use(DebugPass, options) : null,
  ], props);

  // Add resource dispatches to render
  const dispatches = yeet({ dispatch: resources.dispatches });
  const combined = [
    quote(dispatches),
    children,
  ];

  // Provide forward-lit material + emit deferred light draw calls
  const view = use(LightMaterial, {
    shadows,
    children: combined,
    then: (light: LightEnv) =>
      useMemo(() => quote([
        yeet({ env: { light }}),
        use(LightRender, {...light, shadows}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ]), [light, shadows]),
  });

  // Pass bindings
  const bindGroups = useStandardBindGroups(resources, flags);

  // Render variants
  const variants = useMakeUseVariants(components, flags);

  return (
    Renderer({
      resources,
      bindGroups,

      variants,
      passes: resolved,

      children: view,
    })
  );
}, 'DeferredRenderer');
