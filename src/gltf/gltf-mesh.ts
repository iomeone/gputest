import type { LC, LiveElement } from '@use-gpu/live';
import type { GLTF, GLTFPrimitiveData } from './types';

import { use, memo, useMemo } from '@use-gpu/live';
import { mat4 } from 'gl-matrix';
import { GLTFPrimitive } from './gltf-primitive';

export type GLTFMeshProps = {
  gltf: GLTF,
  mesh: number,

  transform?: mat4,
};

export const GLTFMesh: LC<GLTFMeshProps> = memo((props: GLTFMeshProps) => {
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
    primitives.map((primitive: GLTFPrimitiveData) => use(GLTFPrimitive, {gltf, primitive, transform})),
    [gltf, primitives, transform]);
}, 'GLTFMesh');
