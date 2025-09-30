import type { LC, PropsWithChildren, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { AggregatedCalls, RenderComponents, VirtualDraw } from '../pass/types';

import { use, memo, unquote, provide, multiGather, extend, useMemo } from '@use-gpu/live';
import { makeBindGroupLayout, makeBindGroup, makeDataBindingsEntries } from '@use-gpu/core';

import { PassContext, VariantContext } from '../providers/pass-provider';
import { useDeviceContext } from '../providers/device-provider';
import { PassReconciler } from '../reconcilers/index';

import { ComputePass } from '../pass/compute-pass';
import { DispatchPass } from '../pass/dispatch-pass';
import { PickingPass } from '../pass/picking-pass';
import { ReadbackPass } from '../pass/readback-pass';
import { ShadowPass } from '../pass/shadow-pass';

const {reconcile, quote} = PassReconciler;

export type RendererProps = PropsWithChildren<{
  entries?: GPUBindGroupLayoutEntry[],
  context?: Record<string, any>,
  overlay?: boolean,
  merge?: boolean,

  buffers: Record<string, UseGPURenderContext[]>,
  passes: LiveElement[],
  components: RenderComponents,
}>;

const HOVERED_VARIANT = 'debug';
const NO_ENTRIES: any[] = [];
const NO_CONTEXT: Record<string, any> = {};

export const Renderer: LC<RendererProps> = memo((props: RendererProps) => {
  const {
    entries = NO_ENTRIES,
    context: renderContext = NO_CONTEXT,
    overlay = false,
    merge = false,

    buffers,
    passes,
    components,
    children,
  } = props;

  const device = useDeviceContext();

  // Pass on shared render context(s) for renderables
  const passContext = useMemo(() => {

    // Prepare shared bind group for forward/deferred lighting
    const hasEntries = !!entries.length;
    const layout = hasEntries ? makeBindGroupLayout(device, entries) : null;
    const bind = layout ? (args: any[]) => {
      const entries = makeDataBindingsEntries(device, args);
      const bindGroup = makeBindGroup(device, layout, entries);

      return (passEncoder: GPURenderPassEncoder) => {
        passEncoder.setBindGroup(1, bindGroup);
      };
    } : () => () => {};

    return {buffers, layout, bind, context: renderContext};
  }, [device, buffers, entries, renderContext]);

  // Provide draw call variants for sub-passes
  const useVariants = useMemo(() => {
    const {shadow, picking} = buffers;

    const getRender = (mode: string, render: string | null = null) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      components.modes[mode] ?? components.renders[render!]?.[mode];

    const getVariants = (!shadow && !picking)
       ? (virtual: VirtualDraw, hovered: boolean) =>
         hovered ? [getRender(HOVERED_VARIANT)] : getRender(virtual.mode, virtual.renderer)

       : (virtual: VirtualDraw, hovered: boolean) => {
          const {mode, renderer, links, defines} = virtual;

          const variants = [];
          if (shadow && mode === 'opaque' && defines?.HAS_SHADOW) {
            variants.push('shadow');
          }
          if (picking && mode !== 'picking' && links?.getPicking) {
            variants.push('picking');
          }
          if (variants.length === 0) return hovered ? [getRender(HOVERED_VARIANT)] : getRender(mode, renderer);

          variants.push(hovered ? HOVERED_VARIANT : mode);
          return variants.map(mode => getRender(mode, renderer));
        };

    const useVariants = (virtual: VirtualDraw, hovered: boolean) =>
      useMemo(() => getVariants(virtual, hovered), [getVariants, virtual, hovered]);

    return useVariants;
  }, [device, buffers, components]);

  // Pass aggregrated calls to pass runners
  const Resume = (
    calls: AggregatedCalls,
  ) =>
    useMemo(() => {
      const {shadow, picking} = buffers;

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
        shadow && calls.shadow ? use(ShadowPass, props) : null,
        ...passes.map(element => extend(element, props)),
        calls.post || calls.readback ? use(ReadbackPass, props) : null,
        picking && calls.picking ? use(PickingPass, props) : null,
      ];
    }, [calls, buffers, passes, overlay, merge]);

  return (
    reconcile(
      quote(
        provide(PassContext, passContext,
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
}, 'Renderer');
