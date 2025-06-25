import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { LightEnv, PassFlags, PassResources, RenderComponents } from '../pass/types';

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
import { DeferredGPass } from '../pass/deferred-g-pass';
import { DeferredResolvePass } from '../pass/deferred-resolve-pass';
import { MotionPass } from '../pass/motion-pass';
import { PickingPass } from '../pass/picking-pass';
import { ShadowPass } from '../pass/shadow-pass';
import { SSAOPass } from '../pass/ssao-pass';

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
  dispatches: [],
  views: {},
};

const NO_OPTIONS: DeferredRendererOptions = {};

export type DeferredRendererOptions = Pick<PassFlags, 'shadows' | 'merge' | 'overlay'>;

export type DeferredRendererProps = PropsWithChildren<{
  resources: PassResources,
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
    overlay = false,
    merge = false,
    overscan = 0,
    debug = null,

    lights = true,
    normals = !!buffers.normal,
    motion = !!buffers.motion,
    ssao = buffers.ssao ? {} : undefined,
    shadows = !!buffers.shadow,
    picking = !!buffers.picking,
  } = options as Record<string, any>;

  const extendedFlags = useMemo(() => ({
    overlay,
    merge,
    overscan,

    lights,
    normals,
    motion,
    ssao,
    shadows,
    picking,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [options, buffers]);

  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Prepare passes
  const resolved = useOne(() => passes ?? [
    motion ? use(MotionPass, options) : null,
    shadows ? use(ShadowPass, options) : null,
    use(DeferredGPass, options),
    ssao ? use(SSAOPass, options) : null,
    use(DeferredResolvePass, options),
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
  const bindGroups = useStandardBindGroups(resources, extendedFlags);

  // Render variants
  const variants = useMakeUseVariants(components, extendedFlags);

  return (
    Renderer({
      resources,
      bindGroups,
      options,

      variants,
      passes: resolved,

      children: view,
    })
  );
}, 'DeferredRenderer');
