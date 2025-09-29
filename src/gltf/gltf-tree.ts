import type { LC, LiveElement } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import type { GLTF } from './types';
import { vec3, mat4, quat } from 'gl-matrix';

import { use, gather, memo, useMemo, useOne } from '@use-gpu/live';
import { useMatrixContext } from '@use-gpu/workbench';

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
