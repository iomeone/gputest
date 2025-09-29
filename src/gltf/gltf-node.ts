import type { LC, LiveElement } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import type { GLTF } from './types';
import { vec3, mat4, quat } from 'gl-matrix';

import { use, gather, memo, useMemo, useOne } from '@use-gpu/live';
import { GLTFMesh } from './gltf-mesh';

export type GLTFNodeProps = {
  gltf: GLTF,
  node: number,
  matrix?: mat4,
};

export const GLTFNode: LC<GLTFNodeProps> = memo((props: GLTFNodeProps) => {
  const {
    gltf,
    node,
    matrix: parent,
  } = props;
  if (!gltf.nodes) return null;

  const {
    mesh,
    matrix,
    translation,
    rotation,
    scale,
    children,
  } = gltf.nodes[node];

  const transform = useMemo(() => {
    if (!(matrix || translation || rotation || scale)) return parent;

    const transform = mat4.create();
    composeTransform(transform, translation, rotation, scale, matrix);
    if (parent) mat4.multiply(transform, parent, transform);
    return transform;
  }, [matrix, translation, rotation, scale]);

  const self = mesh != null ? (
    use(GLTFMesh, {gltf, mesh, transform})
  ) : null;

  if (children) {
    const out: LiveElement[] = [];

    if (self) out.push(self);
    out.push(...Array.from(children).map((node: number) => use(GLTFNode, {gltf, node, matrix: transform})));
    return out;
  }

  return self;
}, 'GLTFNode');

const makeComposeTransform = () => {

  const q = quat.create();
  const p = vec3.create();
  const s = vec3.create();
  const t = mat4.create();

  return (
    transform: mat4,
    position?: vec3 | TypedArray | null,
    quaternion?: quat | TypedArray | null,
    scale?: vec3 | TypedArray | null,
    matrix?: mat4 | TypedArray | null,
  ) => {

    if (quaternion != null) quat.copy(q, quaternion as any);

    if (position != null) vec3.copy(p, position as any);
    else vec3.zero(p);

    if (scale != null) vec3.copy(s, scale as any);
    else vec3.set(s, 1, 1, 1);
    
    mat4.fromRotationTranslationScale(transform, q, p, s);
    return transform;
  }
}

const composeTransform = makeComposeTransform();