import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { AggregatedCalls, PassBindGroup, PassResources, RenderComponents, VirtualDraw } from '../pass/types';

import { use, memo, unquote, provide, multiGather, extend, useMemo, useNoMemo } from '@use-gpu/live';

import { PassContext, VariantContext, VariantContextProps } from '../providers/pass-provider';
import { PassReconciler } from '../reconcilers/index';

import { ComputePass } from '../pass/compute-pass';
import { DispatchPass } from '../pass/dispatch-pass';
import { PickingPass } from '../pass/picking-pass';
import { ReadbackPass } from '../pass/readback-pass';

const {reconcile, quote} = PassReconciler;

export type RendererProps = PropsWithChildren<{
  overlay?: boolean,
  merge?: boolean,

  resources: PassResources,
  bindGroups: Record<string, PassBindGroup>,

  passes: LiveElement[],
  variants: VariantContextProps,
}>;

/**
  Materializes variants of draw calls for its children. (VariantContext)
  Multi-gathers the draw calls and process them with the given render passes. (PassContext)
*/
export const Renderer: LC<RendererProps> = memo((props: RendererProps) => {
  const {
    overlay = false,
    merge = false,

    resources,
    bindGroups,

    passes,
    variants,

    children,
  } = props;

  // Pass on shared render context(s) for renderables
  const passContext = useMemo(() => ({...resources, bindGroups}), [resources, bindGroups]);

  // Pass aggregrated calls to pass runners
  const Resume = (
    calls: AggregatedCalls,
  ) =>
    useMemo(() => {
      const env = (calls.env ?? []).reduce((env: Record<string, any>, data: Record<string, any>) => {
        for (const k in data) env[k] = data[k];
        return env;
      }, {});

      const props: Record<string, any> = {calls, env};

      if (overlay) props.overlay = true;
      if (merge) props.merge = true;

      return [
        calls.dispatch ? use(DispatchPass, props) : null,
        calls.pre || calls.compute ? use(ComputePass, props) : null,
        ...passes.map(element => extend(element, props)),
        calls.post || calls.readback ? use(ReadbackPass, props) : null,
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calls, passes, overlay, merge]);

  return (
    reconcile(
      quote(
        provide(PassContext, passContext,
          multiGather(
            unquote(provide(VariantContext, variants, children)),
            Resume
          )
        )
      )
    )
  );
}, 'Renderer');
