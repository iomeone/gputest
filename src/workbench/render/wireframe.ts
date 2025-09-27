import type { Lazy } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { resolve } from '@use-gpu/core';
import { useMemo, useNoMemo } from '@use-gpu/live';
import { getBoundShader } from '../hooks/useBoundShader';

import { getWireframeListVertex } from '@use-gpu/wgsl/render/wireframe/wireframe-list.wgsl';
import { getWireframeStripVertex } from '@use-gpu/wgsl/render/wireframe/wireframe-strip.wgsl';

const WIREFRAME_BINDINGS = bundleToAttributes(getWireframeListVertex);

export const getWireframe = (
  getVertex: ShaderModule,
  vertexCount: Lazy<number>,
  instanceCount: Lazy<number>,
  topology: string,
) => {
  const i = instanceCount;
  const v = vertexCount;
  
  const isTriangleStrip = topology === 'triangle-strip';

  let instanceSize;

  if (isTriangleStrip) {
    const edges = () => (resolve(v) - 2) * 2 + 1;

    vertexCount = 4;
    instanceCount = () => edges() * resolve(i);
    instanceSize = edges;
  }
  else /*if (topology === 'triangle-list')*/ {
    vertexCount = 18;
    instanceCount = () => resolve(v) * resolve(i);
    instanceSize = () => resolve(v);
  }
  
  const shader = isTriangleStrip ? getWireframeStripVertex : getWireframeListVertex;
  const bound = getBoundShader(shader, WIREFRAME_BINDINGS, [getVertex, instanceSize]);

  return {
    getVertex: bound,
    vertexCount,
    instanceCount,
  };
}
