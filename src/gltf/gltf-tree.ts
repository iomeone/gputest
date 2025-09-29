import type { LC, LiveElement } from '../live';
import type { TypedArray } from '../core';
import type { GLTF } from './types';
import { vec3, mat4, quat } from 'gl-matrix';

import { use, gather, memo, useMemo, useOne } from '../live';
import { useMatrixContext } from '../workbench';

import { GLTFNode } from './gltf-node';

export type GLTFTreeProps = {
  gltf: GLTF,
  node: number,
};

export const GLTFTree: LC<GLTFTreeProps> = memo((props: GLTFTreeProps) => {
  const {
    gltf,
    node,
  } = props;
  if (!gltf.nodes) return null;

  const matrix = useMatrixContext();

  return use(GLTFNode, {gltf, node, matrix});
}, 'GLTFTree');
