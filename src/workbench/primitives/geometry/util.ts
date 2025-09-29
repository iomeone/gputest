import type { Geometry } from '@use-gpu/core';
import { vec3 } from 'gl-matrix';

export const forMeshTriangles = (() => {
  const v1 = vec3.create();
  const v2 = vec3.create();
  const v3 = vec3.create();

  return (
    mesh: Geometry,
    callback: (v1: vec3, v2: vec3, v3: vec3, i: number) => void,
  ) => {
    const {count, attributes: {positions, indices}} = mesh;
    const getVertex = (v: vec3, i: number) => {
      const j = (indices ? indices[i] : i) * 4;
      vec3.set(v, positions[j], positions[j + 1], positions[j + 2]);
    };

    for (let i = 0; i < count; i += 3) {
      getVertex(v1, i);
      getVertex(v2, i + 1);
      getVertex(v3, i + 2);
      callback(v1, v2, v3, i / 3);
    }
  }
})();
