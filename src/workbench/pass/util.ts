import type { UseGPURenderContext } from '@use-gpu/core';
import type { Ref } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Culler, Renderable } from './types';

import { getBundleName } from '@use-gpu/shader/wgsl';

import { resolve, proxy } from '@use-gpu/core';
import { vec3 } from 'gl-matrix';

export const getShaderLabel = (bundles: (ShaderModule | null | undefined)[], prefix: string | null | undefined) => {
  const parts = bundles.map(b => b && getBundleName(b));
  return [prefix, ...parts].filter(s => s != null).join('::');
};

export const getRenderPassDescriptor = (
  renderContext: UseGPURenderContext,
  {overlay, merge, stencil, label, view = 0}: {
    overlay?: boolean,
    merge?: boolean,
    stencil?: boolean,
    label?: string,
    view?: number,
  }
): GPURenderPassDescriptor => {
  const {viewAttachments} = renderContext;

  const descriptor = {
    label,
    colorAttachments: viewAttachments?.[view]?.colorAttachments ?? [],
    depthStencilAttachment: viewAttachments?.[view]?.depthStencilAttachment,
  };

  if (stencil) {
    descriptor.colorAttachments = [];
  }
  else if (overlay) {
    descriptor.colorAttachments = descriptor.colorAttachments?.map(
      (a: GPURenderPassColorAttachment) => proxy(a, {loadOp: 'load'})
    );
  }

  if ((merge || stencil) && descriptor.depthStencilAttachment) {
    const {depthLoadOp, stencilLoadOp} = descriptor.depthStencilAttachment;
    const override: Record<string, any> = {};

    if (depthLoadOp) override.depthLoadOp = merge || stencil ? 'load' : 'clear';
    if (stencilLoadOp) override.stencilLoadOp = stencil ? 'clear' : 'load';
    if (stencil) override.depthWriteEnabled = false;

    descriptor.depthStencilAttachment = proxy(descriptor.depthStencilAttachment, override);
  }

  return descriptor;
}

const CALLS: Renderable[] = [];
const ORDER: number[] = [];
const DEPTHS: (number | boolean)[] = [];

export const drawToPass = (
  cull: Culler,
  renderables: Renderable[],
  passEncoder: GPURenderPassEncoder,
  countGeometry: (v: number, t: number) => void,
  uniforms: Record<string, Ref<any>>,
  sign: number = 1,
  flip: boolean = false,
) => {
  const calls = CALLS;
  const order = ORDER;
  const depths = DEPTHS;

  calls.length = 0;
  order.length = 0;
  depths.length = 0;

  let i = 0;
  for (const call of renderables) {
    const {bounds} = call;

    let depth: number | boolean;
    if (bounds) {
      const {center, radius} = resolve(bounds);
      depth = cull(center as any as vec3, radius);
    }
    else {
      depth = true;
    }

    if (depth !== false) {
      calls.push(call);
      depths.push(depth);
      order.push(i);
      i++;
    }
  }

  order.sort((a, b) => {
    const da = depths[a] as number | true;
    const db = depths[b] as number | true;
    if (da === db) return a - b;
    if (da === true) return 1;
    if (db === true) return -1;
    return (da - db) * sign;
  })

  for (const i of order) calls[i].draw(passEncoder, countGeometry, uniforms, flip);
};
