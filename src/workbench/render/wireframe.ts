import type { StorageSource, Lazy } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { resolve, makeDataBuffer } from '@use-gpu/core';
import { getShader } from '../hooks/useShader';

import { getWireframeListVertex } from '@use-gpu/wgsl/render/wireframe/wireframe-list.wgsl';
import { getWireframeStripVertex } from '@use-gpu/wgsl/render/wireframe/wireframe-strip.wgsl';
import { main as makeWireframeIndirectCommand } from '@use-gpu/wgsl/render/wireframe/wireframe-indirect.wgsl';

/** Produce a wireframe vertex shader for a given solid vertex shader. */
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
    vertexCount = 12;
    instanceCount = () => resolve(v) * resolve(i);
    instanceSize = () => resolve(v);
  }

  const shader = isTriangleStrip ? getWireframeStripVertex : getWireframeListVertex;
  const bound = getShader(shader, [getVertex, instanceSize]);

  return {
    getVertex: bound,
    vertexCount,
    instanceCount,
    topology,
  };
}

/** Produce an indirect wireframe vertex shader for a given solid vertex shader + indirect draw call. */
export const getWireframeIndirect = (
  device: GPUDevice,
  getVertex: ShaderModule,
  indirect: StorageSource,
  topology: string,
) => {
  const isTriangleStrip = topology === 'triangle-strip';

  const N = 128;
  const buffer = makeDataBuffer(device, N * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT);
  const destination = {
    buffer,
    format: 'u32',
    length: 8,
    size: [8],
    version: 0,
    readWrite: true,
  } as StorageSource;

  // Offset must be % 256
  const instanceSize = {...destination, byteOffset: 256, readWrite: false};
  const defines = {isTriangleStrip};

  const boundDispatch = getShader(makeWireframeIndirectCommand, [indirect, destination], defines);

  const shader = isTriangleStrip ? getWireframeStripVertex : getWireframeListVertex;
  const boundVertex = getShader(shader, [getVertex, instanceSize]);

  return {
    getVertex: boundVertex,
    wireframeCommand: boundDispatch,
    wireframeIndirect: destination,
  };
}
