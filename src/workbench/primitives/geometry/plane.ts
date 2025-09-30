import type { CPUGeometry } from '@use-gpu/core';
import { makeNumberWriter } from '@use-gpu/core';

type PlaneGeometryProps = {
  width?: number,
  height?: number,
  axes?: string,
  detail?: [number, number],
  tile?: [number, number],
};

export const makePlaneGeometry = ({
  width = 1,
  height = width,
  axes = 'xy',
  detail: [detailU, detailV] = [1, 1],
  tile = [1, 1],
}: PlaneGeometryProps = {}): CPUGeometry => {
  const nQuads = detailU * detailV;
  const count = nQuads * 6;

  const positions = new Float32Array(count * 4);
  const normals = new Float32Array(count * 4);
  const uvs = new Float32Array(count * 4);

  const {emit: positionEmitter} = makeNumberWriter(positions, 4);
  const {emit: normalEmitter} = makeNumberWriter(normals, 4);
  const {emit: uvEmitter} = makeNumberWriter(uvs, 4);

  const [first, second] = axes.split('');

  const emitPosition = (x: number, y: number) => {
    let xx = 0;
    let yy = 0;
    let zz = 0;

    if      (first === 'x') xx = x * width - width / 2;
    else if (first === 'y') yy = x * width - width / 2;
    else if (first === 'z') zz = x * width - width / 2;

    if      (second === 'x') xx = y * height - height / 2;
    else if (second === 'y') yy = y * height - height / 2;
    else if (second === 'z') zz = y * height - height / 2;

    positionEmitter(xx, yy, zz, 1);
  };

  const emitNormal = (x: number, y: number, z: number) =>
    normalEmitter(x, y, z, 0);

  const emitUV = (x: number, y: number) =>
    uvEmitter(x * tile[0], y * tile[1], 0, 0);

  const iu = 1 / detailU;
  const iv = 1 / detailV;

  for (let v = 0; v < detailV; ++v) {
    const fv = v * iv;

    for (let u = 0; u < detailU; ++u) {
      const fu = u * iu;

      emitPosition(fu, fv);
      emitPosition(fu, fv + iv);
      emitPosition(fu + iu, fv);

      emitPosition(fu + iu, fv);
      emitPosition(fu, fv + iv);
      emitPosition(fu + iu, fv + iv);

      emitUV(fu, fv);
      emitUV(fu, fv + iv);
      emitUV(fu + iu, fv);

      emitUV(fu + iu, fv);
      emitUV(fu, fv + iv);
      emitUV(fu + iu, fv + iv);
    }
  }

  const nx = +(axes.indexOf('x') === -1);
  const ny = +(axes.indexOf('y') === -1);
  const nz = +(axes.indexOf('z') === -1);
  for (let i = 0; i < 6 * nQuads; ++i) emitNormal(nx, ny, nz);

  return {
    count,
    attributes: {positions, normals, uvs},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', uvs: 'vec4<f32>'},
  };
}
