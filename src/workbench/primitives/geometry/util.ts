import type { CPUGeometry, TypedArray } from '../../../core';
import { vec3, mat3, mat4 } from 'gl-matrix';
import { UNIFORM_ARRAY_DIMS } from '../../../core';
import { patch, toMurmur53, $nop } from '../../../state';

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
    const dims = Math.floor((UNIFORM_ARRAY_DIMS as any)[formats.positions]) || 1;

    const getVertex = (v: vec3, i: number) => {
      const j = (indices ? indices[i] : i);
      const jn = j * dims;
      vec3.set(v, positions[jn], positions[jn + 1], positions[jn + 2]);
      return j;
    };

    const n = count ?? indices?.length ?? (positions?.length || 0) / dims;
    for (let i = 0, j = 0; i < n; i += 3, j++) {
      const a = getVertex(v1, i);
      const b = getVertex(v2, i + 1);
      const c = getVertex(v3, i + 2);
      callback(v1, v2, v3, j, a, b, c);
    }
  }
})();

export const getMeshTriangle = (() => {
  const v1 = vec3.create();
  const v2 = vec3.create();
  const v3 = vec3.create();

  return <T>(
    mesh: CPUGeometry,
    index: number,
    callback: (
      v1: vec3,
      v2: vec3,
      v3: vec3,
    ) => T,
  ): T => {
    const {attributes: {positions, indices}, formats} = mesh;
    const dims = Math.floor((UNIFORM_ARRAY_DIMS as any)[formats.positions]) || 1;

    const getVertex = (v: vec3, i: number) => {
      const j = (indices ? indices[i] : i);
      const jn = j * dims;
      vec3.set(v, positions[jn], positions[jn + 1], positions[jn + 2]);
      return j;
    };

    const i3 = index * 3;
    getVertex(v1, i3);
    getVertex(v2, i3 + 1);
    getVertex(v3, i3 + 2);

    return callback(v1, v2, v3);
  }
})();

export const computeMeshNormals = (
  mesh: CPUGeometry,
  smoothTolerance: number = 0.1,
) => {
  const {attributes: {positions, indices}, formats} = mesh;
  const normals = computeVertexNormals(positions, indices, formats.positions, 3, smoothTolerance);

  return patch(mesh, {
    attributes: {normals},
    formats: {normals: 'vec4<f32>'},
    unwelded: {normals: true},
  });
};

export const computeVertexNormals = (() => {
  const v1 = vec3.create();
  const v2 = vec3.create();
  const v3 = vec3.create();

  return (
    positions: TypedArray,
    indices: TypedArray | null,
    format: string,
    faceVertexCount: number | number[] | TypedArray,
    smoothTolerance: number = 0.1,
  ): TypedArray => {
    const dims = Math.floor((UNIFORM_ARRAY_DIMS as any)[format]) || 1;

    // Fixed or variable face vertex count
    const getFaceVertexCount = typeof faceVertexCount === 'number'
      ? () => faceVertexCount
      : (i: number) => faceVertexCount[i];

    // Load direct or indexed position
    const getVertex = (v: vec3, i: number) => {
      const j = (indices ? indices[i] : i);
      const jn = j * dims;
      vec3.set(v, positions[jn], positions[jn + 1], positions[jn + 2]);
      return j;
    };

    // Computed normals + metric
    const faceNormals: vec3[] = [];
    const getSmoothVertexNormal = (selfFace: number, adjacentFaces: number[]) => {
      const faceNormal = faceNormals[selfFace];

      for (const faceIndex of adjacentFaces) {
        const dot = vec3.dot(faceNormal, faceNormals[faceIndex]);
        if (dot > 1 - smoothTolerance) {
          vec3.add(v1, v1, faceNormals[faceIndex]);
        }
      }

      return vec3.normalize(v1, v1);
    };

    const vertexCount = indices ? indices.length : positions.length / dims;
    const vertexNormals = new Float32Array(vertexCount * 4);

    // Compute normal per face
    for (let vertexIndex = 0, faceIndex = 0; vertexIndex < vertexCount;) {
      const m = getFaceVertexCount(faceIndex);

      // Try every vertex offset in case of 0º corners
      for (let i = 0; i < m - 2; ++i) {
        const base = vertexIndex + i;

        getVertex(v1, base);
        getVertex(v2, base + 1);
        getVertex(v3, base + 2);

        vec3.sub(v1, v1, v2);
        vec3.sub(v3, v3, v2);
        vec3.cross(v2, v3, v1);

        const l = vec3.length(v2);
        if (l > 0) {
          vec3.scale(v2, v2, 1 / l);
          break;
        }
      }

      faceNormals.push(vec3.clone(v2));

      vertexIndex += m;
      faceIndex++;
    }

    // Compute vertex to face mapping
    const vertexMap = new Map<number, number[]>();
    for (let vertexIndex = 0, faceIndex = 0; vertexIndex < vertexCount;) {
      const m = getFaceVertexCount(faceIndex);

      for (let i = 0; i < m; ++i) {
        const base = vertexIndex + i;

        getVertex(v1, base);

        const hash = toMurmur53(v1);
        if (!vertexMap.has(hash)) vertexMap.set(hash, []);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const list = vertexMap.get(hash)!;
        list.push(faceIndex);
      }

      vertexIndex += m;
      faceIndex++;
    }

    // Assign normals
    for (let vertexIndex = 0, faceIndex = 0; vertexIndex < vertexCount;) {
      const m = getFaceVertexCount(faceIndex);

      for (let i = 0; i < m; ++i) {
        const base = vertexIndex + i;
        getVertex(v1, base);

        const hash = toMurmur53(v1);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const list = vertexMap.get(hash)!;

        const smoothNormal = getSmoothVertexNormal(faceIndex, list);

        const i4 = base * 4;
        vertexNormals[i4] = smoothNormal[0];
        vertexNormals[i4 + 1] = smoothNormal[1];
        vertexNormals[i4 + 2] = smoothNormal[2];
        vertexNormals[i4 + 3] = 1;
      }

      vertexIndex += m;
      faceIndex++;
    }

    return vertexNormals;
  }
})();

export const transformMesh = (geometry: CPUGeometry, matrix: mat4 | null) => {
  if (!matrix) return geometry;

  const {attributes: {positions, normals, tangents}, formats} = geometry;

  const ps = positions ? transformPositions(positions, formats.positions, matrix) : $nop();
  const ns = normals ? transformNormals(normals, formats.normals, matrix) : $nop();
  const ts = tangents ? transformNormals(tangents, formats.tangents, matrix) : $nop();

  return patch(geometry, {
    attributes: {positions: ps, normals: ns, tangents: ts},
    formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', tangents: 'vec4<f32>'}
  });
}

export const transformPositions = (pos: TypedArray, format: string, matrix: mat4 | null) => {
  let step = 0;
  let stride = 0;
  if (format === 'vec3<f32>') { step = 3; stride = 3; }
  if (format === 'vec3to4<f32>') { step = 3; stride = 4; }
  if (format === 'vec4<f32>') { step = 4; stride = 4; }
  if (!step) throw new Error(`unimplemented CPUGeometry positions format '${format}' for transformPositions`);

  const v = vec3.create();

  const n = Math.floor(pos.length / step);
  const out = new Float32Array(n * 4);
  for (let i = 0, j = 0, k = 0; i < n; ++i, j += step, k += stride) {
    const x = pos[j];
    const y = pos[j + 1];
    const z = pos[j + 2];
    const w = step === 4 ? pos[j + 3] : 1;

    vec3.set(v, x, y, z);
    if (matrix) vec3.transformMat4(v, v, matrix);

    out[k    ] = v[0];
    out[k + 1] = v[1];
    out[k + 2] = v[2];
    if (stride === 4) out[k + 3] = w;
  }

  return out;
};

export const transformNormals = (norms: TypedArray, format: string, matrix: mat4 | null) => {
  let step = 0;
  let stride = 0;
  if (format === 'vec3<f32>') { step = 3; stride = 3; }
  if (format === 'vec3to4<f32>') { step = 3; stride = 4; }
  if (format === 'vec4<f32>') { step = 4; stride = 4; }
  if (!step) throw new Error(`unimplemented CPUGeometry normals format '${format}' for transformNormals`);

  const m = matrix ? mat3.normalFromMat4(mat3.create(), matrix) : mat3.create();
  const v = vec3.create();

  const n = Math.floor(norms.length / step);
  const out = new Float32Array(n * 4);
  for (let i = 0, j = 0, k = 0; i < n; ++i, j += step, k += stride) {
    const x = norms[j];
    const y = norms[j + 1];
    const z = norms[j + 2];
    const w = step === 4 ? norms[j + 3] : 0;

    vec3.set(v, x, y, z);
    if (matrix) vec3.transformMat3(v, v, m);

    out[k    ] = v[0];
    out[k + 1] = v[1];
    out[k + 2] = v[2];
    if (stride === 4) out[k + 3] = w;
  }

  return out;
};
