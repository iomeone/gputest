import type { CPUGeometry, TypedArray } from '@use-gpu/core';
import { vec3, mat3, mat4 } from 'gl-matrix';
import { UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

export const forMeshTriangles = (() => {
  const v1 = vec3.create();
  const v2 = vec3.create();
  const v3 = vec3.create();

  return (
    mesh: CPUGeometry,
    callback: (
      v1: vec3,
      v2: vec3,
      v3: vec3,
      index: number,
      i1: number,
      i2: number,
      i3: number,
    ) => void,
  ) => {
    const {count, attributes: {positions, indices}, formats} = mesh;
    const getVertex = (v: vec3, i: number) => {
      const j = (indices ? indices[i] : i) * 4;
      vec3.set(v, positions[j], positions[j + 1], positions[j + 2]);
      return j;
    };

    const dims = Math.floor((UNIFORM_ARRAY_DIMS as any)[formats.positions]) || 1;
    const n = count ?? indices?.length ?? (positions?.length || 0) / dims;
    for (let i = 0, j = 0; i < n; i += 3, j++) {
      const a = getVertex(v1, i);
      const b = getVertex(v2, i + 1);
      const c = getVertex(v3, i + 2);
      callback(v1, v2, v3, j, a, b, c);
    }
  }
})();

export const transformPositions = (pos: TypedArray, format: string, matrix: mat4 | null) => {
  let step = 0;
  if (format === 'vec3to4<f32>') step = 3;
  if (format === 'vec4<f32>') step = 4;
  if (!step) throw new Error(`unimplemented CPUGeometry positions format '${format}'`);

  const v = vec3.create();

  const n = Math.floor(pos.length / step);
  const out = new Float32Array(n * 4);
  for (let i = 0, j = 0, k = 0; i < n; ++i, j += step, k += 4) {
    const x = pos[j];
    const y = pos[j + 1];
    const z = pos[j + 2];
    const w = step === 4 ? pos[j + 3] : 1;

    vec3.set(v, x, y, z);
    if (matrix) vec3.transformMat4(v, v, matrix);

    out[k    ] = v[0];
    out[k + 1] = v[1];
    out[k + 2] = v[2];
    out[k + 3] = w;
  }

  return out;
};

export const transformNormals = (norms: TypedArray, format: string, matrix: mat4 | null) => {
  let step = 0;
  if (format === 'vec3to4<f32>') step = 3;
  if (format === 'vec4<f32>') step = 4;
  if (!step) throw new Error(`unimplemented CPUGeometry normals format '${format}'`);

  const m = matrix ? mat3.normalFromMat4(mat3.create(), matrix) : mat3.create();
  const v = vec3.create();

  const n = Math.floor(norms.length / step);
  const out = new Float32Array(n * 4);
  for (let i = 0, j = 0, k = 0; i < n; ++i, j += step, k += 4) {
    const x = norms[j];
    const y = norms[j + 1];
    const z = norms[j + 2];
    const w = step === 4 ? norms[j + 3] : 0;

    vec3.set(v, x, y, z);
    if (matrix) vec3.transformMat3(v, v, m);

    out[k    ] = v[0];
    out[k + 1] = v[1];
    out[k + 2] = v[2];
    out[k + 3] = w;
  }

  return out;
};
