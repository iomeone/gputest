import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { RenderComponents, VirtualDraw, AggregatedCalls } from '../pass/types';

import { use, provide, unquote, multiGather, memo, useCallback, useMemo } from '@use-gpu/live';

import { PassContext, VariantContext } from '../providers/pass-provider';
import { PassReconciler } from '../reconcilers/index';

import { DebugRender } from './forward/debug';
import { SolidRender } from './forward/solid';

import { ColorPass } from '../pass/color-pass';
import { ComputePass } from '../pass/compute-pass';
import { DispatchPass } from '../pass/dispatch-pass';
import { ReadbackPass } from '../pass/readback-pass';

const {reconcile, quote} = PassReconciler;

export type FullScreenRendererProps = PropsWithChildren<{
  overlay?: boolean,
  merge?: boolean,
}>;

const NO_ENV: Record<string, any> = {};

const COMPONENTS = {
  modes: {
    debug: DebugRender,
    opaque: SolidRender,
    transparent: SolidRender,
  },
  renders: {},
} as RenderComponents;

export const FullScreenRenderer: LC<FullScreenRendererProps> = memo((props: FullScreenRendererProps) => {
  const {
    overlay = false,
    merge = false,
    children,
  } = props;

  const useVariants = useCallback((virtual: VirtualDraw, hovered: boolean) =>
    useMemo(() => hovered ? [DebugRender] : COMPONENTS.modes[virtual.mode], [virtual, hovered])
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
    }, [calls, overlay, merge]);

  return (
    reconcile(
      quote(
        provide(PassContext, NO_ENV,
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
