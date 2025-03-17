import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { RenderViewType } from '@use-gpu/core';
import type { LightEnv, PassResources, PassFlags, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { PassReconciler } from '../reconcilers/index';
import { useRenderContext } from '../providers/render-provider';

import { DebugPass } from '../pass/debug-pass';
import { MotionPass } from '../pass/motion-pass';
import { NormalPass } from '../pass/normal-pass';
import { PickingPass } from '../pass/picking-pass';
import { ShadowPass } from '../pass/shadow-pass';
import { SSAOPass } from '../pass/ssao-pass';

import { DebugRender } from './forward/debug';
import { PickingRender } from './forward/picking';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { NormalRender } from './forward/normal';
import { UIRender } from './forward/ui';

import { useStandardBindGroups } from '../pass/bindings';
import { useMakeUseVariants } from '../pass/variants';

import { ColorPass } from '../pass/color-pass';
import { ColorCubePass } from '../pass/color-cube-pass';

import { Renderer } from './renderer';
import { LightMaterial } from './light/light-material';

const {quote} = PassReconciler;

const DEFAULT_PASS: Record<RenderViewType, LiveElement> = {
  '2d': ColorPass,
  'cube': ColorCubePass,
};

const NO_OPTIONS: Record<string, any> = {};

export type ForwardRendererFlags = Pick<PassFlags, 'lights' | 'shadows' | 'merge' | 'overlay'>;

export type ForwardRendererProps = PropsWithChildren<{
  resources: PassResources,
  options?: ForwardRendererFlags,
  passes?: LiveElement[],
  components?: RenderComponents,
}>;

const getComponents = ({modes = {}, renders = {}}: Partial<RenderComponents>): RenderComponents => {
  return {
    modes: {
      debug: DebugRender,
      picking: PickingRender,
      shadow: ShadowRender,
      normal: NormalRender,
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

/** Forward-mode rendering with lights immediately evaluated in-shader */
export const ForwardRenderer: LC<ForwardRendererProps> = memo((props: ForwardRendererProps) => {
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
  
    lights = false,
    normals = !!buffers.normal,
    motion = !!buffers.motion,
    ssao = !!buffers.ssao,
    shadows = !!buffers.shadow,
    picking = !!buffers.picking,
  } = options;

  const flags = useMemo(() => ({
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

  // Adapt to view type (2d or cube)
  const {viewType} = useRenderContext();

  // Prepare passes
  const resolved = useMemo(() => passes ?? [
    normals ? use(NormalPass, options) : null,
    motion ? use(MotionPass, options) : null,
    ssao ? use(SSAOPass, options) : null,
    shadows ? use(ShadowPass, options) : null,
    use(DEFAULT_PASS[viewType], options),
    picking ? use(PickingPass, options) : null,
    debug ? use(DebugPass, options) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [props, viewType]);

  // Add resource dispatches to render
  const dispatches = yeet({ dispatch: resources.dispatches });
  const combined = [
    quote(dispatches),
    children,
  ];

  // Provide forward-lit material
  const view = lights ? use(LightMaterial, {
    shadows,
    children: combined,
    then: (light: LightEnv) =>
      useOne(() => quote(yeet({ env: { light }})), light)
  }) : combined;

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
}, 'ForwardRenderer');
