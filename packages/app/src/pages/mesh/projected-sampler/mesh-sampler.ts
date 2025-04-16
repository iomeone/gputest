import type { CPUGeometry, VectorLike } from '@use-gpu/core';
import { vec3 } from 'gl-matrix';
import { patch } from '@use-gpu/state';
import { forMeshTriangles, getMeshTriangle } from '@use-gpu/workbench';

export const cullMesh = (
  mesh: CPUGeometry,
  viewPosition: VectorLike,
  sign: number = 1,
) => {
  const culledIndices: number[] = [];

  const n3 = vec3.create();
  const v1p = vec3.create();
  const v12 = vec3.create();
  const v13 = vec3.create();

  let max = 0;
  forMeshTriangles(mesh, (
    v1: vec3,
    v2: vec3,
    v3: vec3,
    index: number,
    i1: number,
    i2: number,
    i3: number,
  ) => {
    vec3.sub(v12, v2, v1);
    vec3.sub(v13, v3, v1);
    vec3.cross(n3, v12, v13);
    vec3.sub(v1p, v1, viewPosition as vec3);

    const cull = sign * vec3.dot(n3, v1p);
    if (cull < 0) {
      culledIndices.push(i1, i2, i3);
      max = Math.max(i3, max);
    }
  });
  
  const ctor = max > 65535 ? Uint32Array : Uint16Array;
  const fmt = max > 65535 ? 'u32' : 'u16';

  const count = culledIndices.length;
  
  const indices = new ctor(culledIndices);
  const culled = patch(mesh, {count, attributes: {indices}, formats: {indices: fmt}});

  return culled;
};

export const sampleMesh = (
  mesh: CPUGeometry,
  sampleCount: number,
) => {
  const summedAreas: number[] = [];
  const samples = new Float32Array(sampleCount * 4);

  const n3 = vec3.create();
  const v12 = vec3.create();
  const v13 = vec3.create();

  let sum = 0;
  forMeshTriangles(mesh, (
    v1: vec3,
    v2: vec3,
    v3: vec3,
  ) => {
    vec3.sub(v12, v2, v1);
    vec3.sub(v13, v3, v1);
    vec3.cross(n3, v12, v13);

    const area = vec3.length(n3) / 2;
    sum += area;
    summedAreas.push(sum);
  });

  const vs = vec3.create();
  const sampleTriangle = (v1: vec3, v2: vec3, v3: vec3) => {
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;
    
    vec3.zero(vs);
    vec3.scaleAndAdd(vs, vs, v1, u);
    vec3.scaleAndAdd(vs, vs, v2, v);
    vec3.scaleAndAdd(vs, vs, v3, w);

    return vs;
  };

  const max = summedAreas.at(-1) || 0;
  const step = max / sampleCount;

  let v = -step / 2;
  let j = 0;

  for (let i = 0; i < sampleCount; ++i) {
    v += step;
    while (summedAreas[j] < v) j++;
    
    const sample = getMeshTriangle(mesh, j, sampleTriangle);
    const i4 = i * 4;
    samples[i4  ] = sample[0];
    samples[i4+1] = sample[1];
    samples[i4+2] = sample[2];
    samples[i4+3] = 1;
  }

  return samples;
};
