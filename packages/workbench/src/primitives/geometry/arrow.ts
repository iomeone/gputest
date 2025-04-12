import type { CPUGeometry } from '@use-gpu/core';

const τ = Math.PI * 2;

export const makeArrowGeometry = (
  detail: number = 8,
  width: number = 2.5
): CPUGeometry => {
  const {positions, normals} = makeArrowVertices(detail, width);

  return {
    attributes: {positions, normals},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>'},
    count: positions.length / 4,
  };
}

const makeArrowVertices = (detail: number, width: number = 2.5) => {

  const ring = [] as [number, number, number, number][];
  const ringNormals = [] as [number, number, number, number][];
  const tipNormals = [] as [number, number, number, number][];

  const vertices = [] as [number, number, number, number][];
  const normals = [] as [number, number, number, number][];

  const nl = Math.hypot(width, 1);
  const nx = -1 / nl;
  const ny = width / nl;

  for (let i = 0; i <= detail; ++i) {
    {
      const a = i / detail * τ;
      const c = Math.cos(a);
      const s = Math.sin(a);
      ring.push([width, c, s, 1]);
      ringNormals.push([nx, ny * c, ny * s, 0]);
    }

    {
      const a = (i + 0.5) / detail * τ;
      const c = Math.cos(a);
      const s = Math.sin(a);
      tipNormals.push([nx, ny * c, ny * s, 0]);
    }
  }

  for (let i = 0; i < detail; ++i) {
    vertices.push(0, 0, 0, 1);
    vertices.push(...ring[i]);
    vertices.push(...ring[i + 1]);

    normals.push(...tipNormals[i]);
    normals.push(...ringNormals[i]);
    normals.push(...ringNormals[i + 1]);
  }

  for (let i = 1; i < detail - 1; ++i) {
    vertices.push(...ring[0]);
    vertices.push(...ring[i + 1]);
    vertices.push(...ring[i]);

    normals.push(1, 0, 0, 0);
    normals.push(1, 0, 0, 0);
    normals.push(1, 0, 0, 0);
  }

  return {
    positions: new Float32Array(vertices),
    normals: new Float32Array(normals),
  };
};
