import type { Geometry } from '@use-gpu/core';
import { makeDataEmitter } from '@use-gpu/core';

type BoxGeometryProps = {
  width?: number,
  height?: number,
  depth?: number,
  uvw?: boolean,
  offset?: [number, number] | [number, number, number],
  tile?: [number, number] | [number, number, number],
};

export const makeBoxGeometry = ({
  width = 1,
  height = width,
  depth = width,
  uvw = false,
  offset = [0, 0, 0],
  tile = [1, 1, 1],
}: BoxGeometryProps = {}): Geometry => {
  const count = 36;

  const positions = new Float32Array(count * 4);
  const normals = new Float32Array(count * 4);
  const uvs = new Float32Array(count * 4);

  const {emit: positionEmitter} = makeDataEmitter(positions, 4);
  const {emit: normalEmitter} = makeDataEmitter(normals, 4);
  const {emit: uvEmitter} = makeDataEmitter(uvs, 4);

  const emitPosition = (x: number, y: number, z: number) =>
    positionEmitter(x * width / 2, y * height / 2, z * depth / 2, 1);

  const emitNormal = (x: number, y: number, z: number) =>
    normalEmitter(x, y, z, 0);

  const emitUV = (x: number, y: number) =>
    uvEmitter(x * tile[0] + offset[0], y * tile[1] + offset[1], 0, 0);

  const emitUVW = (x: number, y: number, z: number) =>
    uvEmitter(x * tile[0] + offset[0], y * tile[1] + offset[1], z * ((tile as any)[2] ?? 1) + ((offset as any)[2] ?? 0), 0);

  emitPosition(1, 1, -1);
  emitPosition(-1, -1, -1);
  emitPosition(-1, 1, -1);
  emitPosition(1, -1, -1);
  emitPosition(-1, -1, -1);
  emitPosition(1, 1, -1);

  emitPosition(1, 1, 1);
  emitPosition(1, -1, -1);
  emitPosition(1, 1, -1);
  emitPosition(1, -1, 1);
  emitPosition(1, -1, -1);
  emitPosition(1, 1, 1);

  emitPosition(-1, 1, 1);
  emitPosition(1, -1, 1);
  emitPosition(1, 1, 1);
  emitPosition(-1, -1, 1);
  emitPosition(1, -1, 1);
  emitPosition(-1, 1, 1);

  emitPosition(-1, 1, -1);
  emitPosition(-1, -1, 1);
  emitPosition(-1, 1, 1);
  emitPosition(-1, -1, -1);
  emitPosition(-1, -1, 1);
  emitPosition(-1, 1, -1);

  emitPosition(1, 1, 1);
  emitPosition(-1, 1, -1);
  emitPosition(-1, 1, 1);
  emitPosition(-1, 1, -1);
  emitPosition(1, 1, 1);
  emitPosition(1, 1, -1);

  emitPosition(1, -1, -1);
  emitPosition(-1, -1, 1);
  emitPosition(-1, -1, -1);
  emitPosition(1, -1, 1);
  emitPosition(-1, -1, 1);
  emitPosition(1, -1, -1);

  for (let i = 0; i < 6; ++i) emitNormal( 0, 0,-1);
  for (let i = 0; i < 6; ++i) emitNormal( 1, 0, 0);
  for (let i = 0; i < 6; ++i) emitNormal( 0, 0, 1);
  for (let i = 0; i < 6; ++i) emitNormal(-1, 0, 0);
  for (let i = 0; i < 6; ++i) emitNormal( 0, 1, 0);
  for (let i = 0; i < 6; ++i) emitNormal( 0,-1, 0);

  if (uvw) {
    emitUVW(1, 1, -1);
    emitUVW(-1, -1, -1);
    emitUVW(-1, 1, -1);
    emitUVW(1, -1, -1);
    emitUVW(-1, -1, -1);
    emitUVW(1, 1, -1);

    emitUVW(1, 1, 1);
    emitUVW(1, -1, -1);
    emitUVW(1, 1, -1);
    emitUVW(1, -1, 1);
    emitUVW(1, -1, -1);
    emitUVW(1, 1, 1);

    emitUVW(-1, 1, 1);
    emitUVW(1, -1, 1);
    emitUVW(1, 1, 1);
    emitUVW(-1, -1, 1);
    emitUVW(1, -1, 1);
    emitUVW(-1, 1, 1);

    emitUVW(-1, 1, -1);
    emitUVW(-1, -1, 1);
    emitUVW(-1, 1, 1);
    emitUVW(-1, -1, -1);
    emitUVW(-1, -1, 1);
    emitUVW(-1, 1, -1);

    emitUVW(1, 1, 1);
    emitUVW(-1, 1, -1);
    emitUVW(-1, 1, 1);
    emitUVW(-1, 1, -1);
    emitUVW(1, 1, 1);
    emitUVW(1, 1, -1);

    emitUVW(1, -1, -1);
    emitUVW(-1, -1, 1);
    emitUVW(-1, -1, -1);
    emitUVW(1, -1, 1);
    emitUVW(-1, -1, 1);
    emitUVW(1, -1, -1);
  }
  else {
    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(0, 1);
    emitUV(1, 1);
    emitUV(0, 0);

    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(0, 1);
    emitUV(1, 1);
    emitUV(0, 0);

    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(0, 1);
    emitUV(1, 1);
    emitUV(0, 0);

    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(0, 1);
    emitUV(1, 1);
    emitUV(0, 0);

    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(1, 1);
    emitUV(0, 0);
    emitUV(0, 1);

    emitUV(0, 0);
    emitUV(1, 1);
    emitUV(1, 0);
    emitUV(0, 1);
    emitUV(1, 1);
    emitUV(0, 0);
  }

  return {
    count,
    attributes: {positions, normals, uvs},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', uvs: 'vec4<f32>'},
  };
}
