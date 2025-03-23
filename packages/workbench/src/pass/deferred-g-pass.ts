import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Renderable } from './types';

import { yeet, memo, useMemo } from '@use-gpu/live';

import { useRenderContext } from '../providers/render-provider';
import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'
import { useTextureAccess, useTextureUVToXY } from '../hooks/useTextureAccess';

import { useCopyDepth } from '../render/copy/value-copy';
import { useApplyPassBindGroup } from './bindings';
import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type DeferredGPassProps = PropsWithChildren<{
  env: Record<string, any>,
  calls: {
    opaque?: Renderable[],
  },
  merge?: boolean,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<DeferredGPass>';
const LABEL = { label };

/** Deferred render pass.

Draws all opaque calls to gBuffer.
*/
export const DeferredGPass: LC<DeferredGPassProps> = memo((props: DeferredGPassProps) => {
  const {
    merge = false,
    calls,
    env,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();
  const {depth} = renderContext;

  const {
    bindGroups: {view: bindGroup},
    buffers: {gBuffer: [gBuffer, depthCopyContext]},
    views: {view: {cull, uniforms}},
  } = usePassContext();

  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup, label);

  if (!depth) throw new Error("Deferred renderer requires a depth buffer");

  const opaques = toArray(calls['opaque'] as Renderable[]);

  const DeferredGPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(gBuffer, {
      label: '<DeferredGPass> GBuffer',
      overlay: false,
      merge,
    }),
    [gBuffer, merge]);

  const depthCopyPassDescriptor = useMemo(() =>
    getRenderPassDescriptor(depthCopyContext, {
      label: '<DeferredPass> Depth Copy',
    }),
    [depthCopyContext]);

  const inspected = inspect({
    output: {
      sources: [...(gBuffer.sources ?? [])],
    },
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });
  
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getDepth = useTextureUVToXY(useTextureAccess(renderContext.depth!)).shader;
  const copyDepthBuffer = useCopyDepth(depthCopyContext, getDepth);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    const commandEncoder = device.createCommandEncoder(LABEL);
    if (!merge) renderContext.swap?.();

    // Produce G-Buffer
    {
      const passEncoder = commandEncoder.beginRenderPass(DeferredGPassDescriptor);
      bindPass?.(passEncoder);
      drawToPass(cull, opaques, passEncoder, countGeometry, uniforms);
      passEncoder.end();
    }

    // Copy depth to side buffer for reading during render pass
    // (TODO: check if we can avoid writeable scope on depth buffer in resolve pasZ, and avoid copy)
    {
      const passEncoder = commandEncoder.beginRenderPass(depthCopyPassDescriptor);
      copyDepthBuffer(passEncoder);
      passEncoder.end();
    }
    /*
    // Note: code below doesn't work to copy from depth+stencil to depth-only.
    // To avoid having to keep a useless extra stencil buffer, use code above instead.
    commandEncoder.copyTextureToTexture(
      {texture: depth.texture},
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {texture: gBuffer.sources![4].texture},
      depth.size
    );
    */

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));
}, 'DeferredGPass');
