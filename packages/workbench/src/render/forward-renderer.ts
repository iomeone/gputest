import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { RenderViewType, UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, PassResources, PassFlags, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { PassReconciler } from '../reconcilers/index';
import { VariantContext } from '../providers/pass-provider';
import { useRenderContext } from '../providers/render-provider';

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

const DEFAULT_PASSES: Record<RenderViewType, LiveElement[]> = {
  '2d': [use(ColorPass, {})],
  'cube': [use(ColorCubePass, {})],
};

const NO_RESOURCES: PassResources = {
  buffers: {},
  bindings: {},
};

const NO_FLAGS: ForwardRendererFlags = {};

export type ForwardRendererFlags = Pick<PassFlags, 'lights' | 'shadows' | 'merge' | 'overlay'>;

export type ForwardRendererProps = PropsWithChildren<{
  resources?: PassResources,
  flags?: ForwardRendererFlags,
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
    flags: propFlags = NO_FLAGS,
    passes,

    children,
  } = props;

  const {buffers} = resources;

  const {
    lights = false,
    overlay = false,
    merge = false,
  
    normals = !!buffers.normal,
    motion = !!buffers.motion,
    ssao = !!buffers.ssao,
    shadows = !!buffers.shadow,
    picking = !!buffers.picking,
  } = propFlags;

  const flags = useMemo(() => ({
    lights,
    overlay,
    merge,
  
    normals,
    motion,
    ssao,
    shadows,
    picking,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [propFlags, buffers]);

  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Adapt to view type (2d or cube)
  const {viewType} = useRenderContext();

  const resolved = useMemo(() => passes ?? [
    normals ? use(NormalPass, props) : null,
    motion ? use(MotionPass, props) : null,
    ssao ? use(SSAOPass, props) : null,
    shadows ? use(ShadowPass, props) : null,
    ...DEFAULT_PASSES[viewType],
    picking ? use(PickingPass, props) : null,
  ], [props, viewType]);

  // Provide forward-lit material
  const view = lights ? use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) =>
      useOne(() => quote(yeet({ env: { light }})), light),
  }) : children;

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

      overlay,
      merge,
      children: view,
    })
  );
}, 'ForwardRenderer');
