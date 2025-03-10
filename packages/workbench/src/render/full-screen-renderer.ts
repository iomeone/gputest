import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { RenderComponents, VirtualDraw, AggregatedCalls } from '../pass/types';

import { use, provide, unquote, multiGather, memo, useCallback, useMemo } from '@use-gpu/live';

import { PassContext, VariantContext } from '../providers/pass-provider';
import { PassReconciler } from '../reconcilers/index';

import { useMinimalBindGroups } from '../pass/bindings';
import { PassFlags } from '../pass/types';

import { DebugRender } from './forward/debug';
import { SolidRender } from './forward/solid';

import { ColorPass } from '../pass/color-pass';
import { ComputePass } from '../pass/compute-pass';
import { DispatchPass } from '../pass/dispatch-pass';
import { ReadbackPass } from '../pass/readback-pass';

const {reconcile, quote} = PassReconciler;

export type FullScreenRendererFlags = Pick<PassFlags, 'merge' | 'overlay'>;

export type FullScreenRendererProps = PropsWithChildren<{
  flags: FullScreenRendererFlags,
}>;

const NO_FLAGS: FullScreenRendererFlags = {
  merge: false,
  overlay: false,
};

//const NO_ENV: Record<string, any> = {buffers: {}};
const NO_ENV: Record<string, any> = {};

const COMPONENTS = {
  modes: {
    debug: DebugRender,
    opaque: SolidRender,
    transparent: SolidRender,
  },
  renders: {},
} as RenderComponents;

/** Simplified full-screen-only renderer that has no rendering variants. */
export const FullScreenRenderer: LC<FullScreenRendererProps> = memo((props: PropsWithChildren<FullScreenRendererProps>) => {
  const {
    flags = NO_FLAGS,
    children,
  } = props;

  const {
    overlay = false,
    merge = false,
  } = flags;
  
  const useVariants = useCallback((virtual: VirtualDraw, hovered: boolean) =>
    useMemo(() => hovered ? [DebugRender] : COMPONENTS.modes[virtual.mode], [virtual, hovered]),
    []
  );

  // Pass aggregrated calls to pass runners
  const Resume = (
    calls: AggregatedCalls,
  ) =>
    useMemo(() => {
      const props: Record<string, any> = {calls, env: NO_ENV};

      if (overlay) props.overlay = true;
      if (merge) props.merge = true;

      return [
        calls.dispatch ? use(DispatchPass, props) : null,
        calls.compute ? use(ComputePass, props) : null,
        use(ColorPass, props),
        calls.post || calls.readback ? use(ReadbackPass, props) : null,
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calls, overlay, merge]);

  // Pass bindings
  const bindGroups = useMinimalBindGroups();

  return (
    reconcile(
      quote(
        provide(PassContext, {bindGroups},
          multiGather(
            unquote(
              provide(VariantContext, useVariants, children)
            ),
            Resume
          )
        )
      )
    )
  );
}, 'FullScreenRenderer');
