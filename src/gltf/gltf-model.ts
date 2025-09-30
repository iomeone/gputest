import type { LC } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import { GLTF, GLTFNodeData } from './types';

import { use, memo, useMemo } from '@use-gpu/live';
import { GLTFNode } from './gltf-node';
import { useMatrixContext } from '@use-gpu/workbench';
import { seq, toArray } from '@use-gpu/core';

export type GLTFModelProps = {
  gltf: GLTF,

  scene?: number,
  node?: number | string,
  nodes?: (number | string)[],
};

const NO_ROOTS: number[] = [];

export const GLTFModel: LC<GLTFModelProps> = memo((props: GLTFModelProps) => {
  const {
    gltf,
    scene: propScene,
    node: propNode,
    nodes: propNodes,
  } = props;

  const matrix = useMatrixContext();

  const roots = useMemo(() => {
    const {scenes, nodes} = gltf;

    const getNodeIndex = (id: number | string): number | null => {
      if (typeof id === 'number') return id;
      if (!nodes) return null;

      const i = nodes.findIndex(({name}: GLTFNodeData) => name === id);
      return i >= 0 ? i : null;
    };

    // Find root nodes to render
    let roots = NO_ROOTS as (number | null)[] | TypedArray;
    if (propNode != null) roots = toArray(getNodeIndex(propNode));
    else if (propNodes != null) roots = propNodes.map((node: number | string) => getNodeIndex(node)).filter((n: number | null) => n != null);
    else {
      const s = propScene ?? gltf.scene;
      if (s != null && scenes) roots = scenes[s]?.nodes ?? NO_ROOTS;
      else roots = seq(nodes?.length || 0);
    }

    return Array.from(roots);
  }, [gltf, propNode, propScene]);

  return roots.map(root => root != null ? use(GLTFNode, {gltf, node: root, matrix}) : null);
}, 'GLTFModel');
