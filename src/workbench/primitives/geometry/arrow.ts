import type { CPUGeometry } from '@use-gpu/core';

const τ = Math.PI * 2;

export const makeArrowGeometry = (
  detail: number = 8,
  width: number = 2.5
): CPUGeometry => {
  const positions = makeArrowVertices(detail, width);

  return {
    attributes: {positions},
    formats: {positions: 'vec4<f32>'},
    count: positions.length / 4,
  };
}

const makeArrowVertices = (detail: number, width: number = 2.5) => {

  const ring = [] as [number, number, number, number][];
  //const normals = [] as number[];
  const vertices = [] as number[];

  for (let i = 0; i <= detail; ++i) {
    {
      const a = i / detail * τ;
      const c = Math.cos(a);
      const s = Math.sin(a);
      ring.push([width, c, s, 1]);//, nx, ny * c, ny * s, 0]);
    }

    /*
    {
      const a = (i + 0.5) / detail * τ;
      const c = Math.cos(a);
      const s = Math.sin(a);
      normals.push([nx, ny * c, ny * s, 0]);
    }
    */
  }

  for (let i = 0; i < detail; ++i) {
    vertices.push(0, 0, 0, 1);//, ...normals[i]);
    vertices.push(...ring[i]);
    vertices.push(...ring[i + 1]);
  }

  for (let i = 1; i < detail - 1; ++i) {
    vertices.push(...ring[0]);
    vertices.push(...ring[i]);
    vertices.push(...ring[i + 1]);
  }

  return new Float32Array(vertices);
};