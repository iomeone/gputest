import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { RenderViewType, UseGPURenderContext } from '@use-gpu/core';
import type { LightEnv, PassFlags, RenderComponents } from '../pass/types';

import { use, yeet, memo, useMemo, useOne } from '@use-gpu/live';

import { PassReconciler } from '../reconcilers/index';
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

import { ColorPass } from '../pass/color-pass';
import { ColorCubePass } from '../pass/color-cube-pass';

import { Renderer } from './renderer';
import { LightMaterial } from './light/light-material';

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
    buffers = NO_BUFFERS,
    flags = NO_FLAGS,
    passes,

    children,
  } = props;

  const {
    lights = false,
    overlay = false,
    merge = false,
  
    normal = !!buffers.normal,
    motion = !!buffers.motion,
    ssao = !!buffers.ssao,
    shadows = !!buffers.shadow,
    picking = !!buffers.picking,
  } = flags;

  const components = useOne(() => getComponents(props.components ?? {}), props.components);

  // Adapt to view type (2d or cube)
  const {viewType} = useRenderContext();

  const resolved = useMemo(() => passes ?? [
    normal ? use(NormalPass, props) : null,
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
  const bindGroups = useStandardBindGroups(buffers, flags);

  return Renderer({ buffers, bindGroups, children: view, components, passes: resolved, overlay, merge });
}, 'ForwardRenderer');
