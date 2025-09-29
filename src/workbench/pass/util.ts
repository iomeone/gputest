import type { UseGPURenderContext } from '@use-gpu/core';
import type { Culler, Renderable } from './types';

import { resolve, proxy } from '@use-gpu/core';
import { mat4, vec3 } from 'gl-matrix';

export const getRenderPassDescriptor = (
  renderContext: UseGPURenderContext,
  {overlay, merge, stencil}: {
    overlay?: boolean,
    merge?: boolean,
    stencil?: boolean,
  }
) => {
  let {colorAttachments, depthStencilAttachment} = renderContext;

  if (stencil) {
    colorAttachments = [];
  }
  else if (overlay) {
    colorAttachments = colorAttachments.map((a: GPURenderPassColorAttachment) => proxy(a, {loadOp: 'load'}));
  }

  if ((merge || stencil) && depthStencilAttachment) {
    const {depthLoadOp, stencilLoadOp} = depthStencilAttachment;
    const override: Record<string, any> = {};

    if (depthLoadOp) override.depthLoadOp = merge || stencil ? 'load' : 'clear';
    if (stencilLoadOp) override.stencilLoadOp = stencil ? 'clear' : 'load';

    depthStencilAttachment = proxy(depthStencilAttachment, override);
  }

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments,
    depthStencilAttachment: depthStencilAttachment ?? undefined,
  };

  return renderPassDescriptor;
}

export const getDrawOrder = (cull: Culler, calls: Renderable[], sign: number = 1) => {
  let i = 0;
  const order: number[] = [];
  const depths: (number | boolean)[] = [];

  for (const {draw, bounds} of calls) {
    let depth: number | boolean;
    if (bounds) {
      const {center, radius} = resolve(bounds);
      depth = cull(center as any as vec3, radius);
    }
    else {
      depth = true;
    }
    depths.push(depth);

    if (depth !== false) order.push(i);
    i++;
  }

  order.sort((a, b) => {
    const da = depths[a] as number | true;
    const db = depths[b] as number | true;
    if (da === db) return a - b;
    if (da === true) return 1;
    if (db === true) return -1;
    return (da - db) * sign;
  })

  return order;
};

export const drawToPass = (
  cull: Culler,
  calls: Renderable[],
  passEncoder: GPURenderPassEncoder,
  countGeometry: (v: number, t: number) => void,
  uniforms: Record<string, any>,
  sign: number = 1,
  flip: boolean = false,
) => {
  const order = getDrawOrder(cull, calls, sign);
  for (const i of order) calls[i].draw(passEncoder, countGeometry, uniforms, flip);
};

const REVERSE_Z = mat4.create();
mat4.translate(REVERSE_Z, REVERSE_Z, vec3.fromValues(0, 0, 1));
mat4.scale(REVERSE_Z, REVERSE_Z, vec3.fromValues(1, 1, -1));

export const reverseZ = (a: mat4, b: mat4) => mat4.multiply(a, REVERSE_Z, b);
