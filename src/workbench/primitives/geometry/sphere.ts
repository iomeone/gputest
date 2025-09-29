import type { Geometry } from '@use-gpu/core';
import { makeDataEmitter } from '@use-gpu/core';

const τ = Math.PI * 2;

export type SphereGeometryProps = {
  width?: number,
  height?: number,
  depth?: number,
  axis?: string,
  uvw?: boolean,
  detail?: [number, number],
  tile?: [number, number] | [number, number, number],
};

export const makeSphereGeometry = ({
  width = 1,
  height = width,
  depth = height,
  axis = 'y',
  uvw = false,
  detail: [detailAxis, detailAround] = [16, 32],
  tile = [1, 1, 1],
}: SphereGeometryProps = {}): Geometry => {
  const verts = (detailAxis + 1) * (detailAround + 1);
  const tris = detailAxis * detailAround * 2;
  const count = tris * 3;

  const positions = new Float32Array(verts * 4);
  const normals = new Float32Array(verts * 4);
  const uvs = new Float32Array(verts * 4);
  const indices = new Uint16Array(tris * 3);

  const {emit: positionEmitter} = makeDataEmitter(positions, 4);
  const {emit: normalEmitter} = makeDataEmitter(normals, 4);
  const {emit: uvEmitter} = makeDataEmitter(uvs, 4);
  const {emit: indexEmitter} = makeDataEmitter(indices, 1);

  const emitPosition = (x: number, y: number, z: number) => {
    if      (axis === 'x') positionEmitter(z * width / 2, x * height / 2, y * depth / 2, 1.0);
    else if (axis === 'y') positionEmitter(y * width / 2, z * height / 2, x * depth / 2, 1.0);
    else if (axis === 'z') positionEmitter(x * width / 2, y * height / 2, z * depth / 2, 1.0);
  };

  const emitNormal = (x: number, y: number, z: number) => {
    if      (axis === 'x') normalEmitter(z, x, y, 0.0);
    else if (axis === 'y') normalEmitter(y, z, x, 0.0);
    else if (axis === 'z') normalEmitter(x, y, z, 0.0);
  };

  const emitUV = (x: number, y: number) =>
    uvEmitter(x * tile[0], y * tile[1], 0, 0);

  const emitUVW = (x: number, y: number, z: number) => {
    if      (axis === 'x') uvEmitter(z * tile[0], x * tile[1], y * ((tile as any)[2] ?? 1), 0.0);
    else if (axis === 'y') uvEmitter(y * tile[0], z * tile[1], x * ((tile as any)[2] ?? 1), 0.0);
    else if (axis === 'z') uvEmitter(x * tile[0], y * tile[1], z * ((tile as any)[2] ?? 1), 0.0);
  };

  const emitIndex = (x: number, y: number) => {
    indexEmitter(x + y * (detailAround + 1));
  };

  const ia = 1 / detailAround;
  const ib = 1 / detailAxis;
  for (let b = 0; b <= detailAxis; ++b) {
    const v = b * ib;
    const theta = (v - .5) * τ/2;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);

    for (let a = 0; a <= detailAround; ++a) {
      const u = a * ia;
      const phi = u * τ;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      emitPosition(c * ct, s * ct, st);
      emitNormal(c * ct, s * ct, st);
      uvw ? emitUVW(c * ct, s * ct, st) : emitUV(u, 1 - v);
    }
  }

  for (let b = 0; b < detailAxis; ++b) {
    for (let a = 0; a < detailAround; ++a) {
      emitIndex(a, b);
      emitIndex(a + 1, b);
      emitIndex(a, b + 1);

      emitIndex(a, b + 1);
      emitIndex(a + 1, b);
      emitIndex(a + 1, b + 1);
    }
  }

  return {
    count,
    attributes: {positions, normals, uvs, indices},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', uvs: 'vec4<f32>', indices: 'u16'},
  };
}
