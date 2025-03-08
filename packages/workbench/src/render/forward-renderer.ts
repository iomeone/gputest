import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { RenderViewType, UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, PassFlags, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { PassReconciler } from '../reconcilers/index';
import { useRenderContext } from '../providers/render-provider';

import { DebugRender } from './forward/debug';
import { ShadedRender } from './forward/shaded';
import { ShadowRender } from './forward/shadow';
import { SolidRender } from './forward/solid';
import { PickingRender } from './forward/picking';
import { UIRender } from './forward/ui';

import { useStandardBindGroups } from '../pass/bindings';

import { ColorPass } from '../pass/color-pass';
import { ColorCubePass } from '../pass/color-cube-pass';

import { Renderer } from './renderer';
import { LightMaterial } from './light/light-material';

import lightBinding from '@use-gpu/wgsl/use/light.wgsl';
import shadowBinding from '@use-gpu/wgsl/use/shadow.wgsl';

const {quote} = PassReconciler;

const DEFAULT_PASSES: Record<RenderViewType, LiveElement[]> = {
  '2d': [use(ColorPass, {})],
  'cube': [use(ColorCubePass, {})],
};

const NO_BUFFERS: Record<string, UseGPURenderContext[]> = {};
const NO_FLAGS: ForwardRendererFlags = {};

export type ForwardRendererFlags = Pick<PassFlags, 'lights' | 'shadows' | 'merge' | 'overlay'>;

export type ForwardRendererProps = PropsWithChildren<{
  buffers?: Record<string, UseGPURenderContext[]>,
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
    buffers = NO_BUFFERS,
    flags = NO_FLAGS,
    passes: propPasses,

    children,
  } = props;

  const {
    lights = false,
    overlay = false,
    merge = false,
    shadows = !!buffers.shadow,
  } = flags;

  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Provide forward-lit material
  const view = lights ? use(LightMaterial, {
    shadows,
    children,
    then: (light: LightEnv) =>
      useOne(() => quote(yeet({ env: { light }})), light),
  }) : children;

  // Adapt to view type (2d or cube)
  const {viewType} = useRenderContext();
  const passes = propPasses ?? DEFAULT_PASSES[viewType];
  if (!passes) throw new Error(`No sub-passes in <ForwardRenderer> for viewType ${viewType}`);

  // Pass bindings
  const bindGroups = useStandardBindGroups(flags);

  return Renderer({ buffers, bindGroups, children: view, components, passes, overlay, merge });
}, 'ForwardRenderer');
