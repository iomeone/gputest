import type { Geometry } from '@use-gpu/core';
import { makeDataEmitter } from '@use-gpu/core';

type PlaneGeometryProps = {
  width?: number,
  height?: number,
  axes?: string,
  tile?: [number, number],
};

export const makePlaneGeometry = ({
  width = 1,
  height = width,
  axes = 'xy',
  tile = [1, 1],
}: PlaneGeometryProps = {}): Geometry => {
  const count = 6;

  const positions = new Float32Array(count * 4);
  const normals = new Float32Array(count * 4);
  const uvs = new Float32Array(count * 4);

  const {emit: positionEmitter} = makeDataEmitter(positions, 4);
  const {emit: normalEmitter} = makeDataEmitter(normals, 4);
  const {emit: uvEmitter} = makeDataEmitter(uvs, 4);

  const [first, second] = axes.split('');

  const emitPosition = (x: number, y: number) => {
    let xx = 0;
    let yy = 0;
    let zz = 0;

    if      (first === 'x') xx = x * width / 2;
    else if (first === 'y') yy = x * width / 2;
    else if (first === 'z') zz = x * width / 2;

    if      (second === 'x') xx = y * height / 2;
    else if (second === 'y') yy = y * height / 2;
    else if (second === 'z') zz = y * height / 2;

    positionEmitter(xx, yy, zz, 1);
  };

  const emitNormal = (x: number, y: number, z: number) =>
    normalEmitter(x, y, z, 0);

  const emitUV = (x: number, y: number) =>
    uvEmitter(x * tile[0], y * tile[1], 0, 0);

  emitPosition(-1,-1);
  emitPosition(-1, 1);
  emitPosition( 1,-1);

  emitPosition( 1,-1);
  emitPosition(-1, 1);
  emitPosition( 1, 1);

  const nx = +(axes.indexOf('x') === -1);
  const ny = +(axes.indexOf('y') === -1);
  const nz = +(axes.indexOf('z') === -1);
  for (let i = 0; i < 6; ++i) emitNormal(nx, ny, nz);

  emitUV(0, 0);
  emitUV(0, 1);
  emitUV(1, 0);

  emitUV(1, 0);
  emitUV(0, 1);
  emitUV(1, 1);

  return {
    count,
    attributes: {positions, normals, uvs},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', uvs: 'vec4<f32>'},
  };
}
