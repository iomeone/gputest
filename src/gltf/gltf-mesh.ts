import type { LC } from '@use-gpu/live';
import type { GLTF, GLTFPrimitiveData } from './types';

import { use, yeet, useMemo } from '@use-gpu/live';
import { mat4 } from 'gl-matrix';

import { GLTFPrimitive } from './gltf-primitive';
import { useGLTFGeometry } from './gltf-geometry';

export type GLTFMeshProps = {
  gltf: GLTF,
  mesh: number,

  transform?: mat4,
};

export const GLTFMesh: LC<GLTFMeshProps> = (props: GLTFMeshProps) => {
  const {
    gltf,
    mesh,
    transform,
  } = props;

  const {meshes} = gltf;
  if (!meshes) return null;

  const {primitives} = meshes[mesh];
  if (!primitives) return null;

  return useMemo(() =>
    gltf.bound
    ? primitives.map((primitive: GLTFPrimitiveData) => use(GLTFPrimitive, {gltf, primitive, transform}))
    : yeet(primitives.map((primitive: GLTFPrimitiveData) => useGLTFGeometry(gltf, primitive, transform))),
    [gltf, primitives, transform]);
};
