import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { PassFlags, RenderComponents } from '../pass/types';

import { use, useOne, memo } from '@use-gpu/live';

import { useMinimalBindGroups } from '../pass/bindings';
import { useMakeUseVariants } from '../pass/variants';

import { DebugRender } from './forward/debug';
import { SolidRender } from './forward/solid';

import { ColorPass } from '../pass/color-pass';

import { Renderer } from './renderer';

export type FullScreenRendererOptions = Pick<PassFlags, 'merge' | 'overlay'>;

export type FullScreenRendererProps = PropsWithChildren<{
  resources: PassResources,
  options: FullScreenRendererOptions,
}>;

const NO_OPTIONS: FullScreenRendererOptions = {
  merge: false,
  overlay: false,
};

const COMPONENTS = {
  modes: {
    debug: DebugRender,
    opaque: SolidRender,
    transparent: SolidRender,
  },
  renders: {},
} as RenderComponents;

/** Simplified full-screen-only renderer that has no rendering variants or sub-passes. */
export const FullScreenRenderer: LC<FullScreenRendererProps> = memo((props: PropsWithChildren<FullScreenRendererProps>) => {
  const {
    resources,
    options = NO_OPTIONS,
    children,
  } = props;

  const bindGroups = useMinimalBindGroups(resources);

  const variants = useMakeUseVariants(COMPONENTS, options);  

  const passes = useOne(() => [use(ColorPass, options)], options);

  return (
    Renderer({
      resources,
      bindGroups,

      variants,
      passes,

      children,
    })
  );
}, 'FullScreenRenderer');
