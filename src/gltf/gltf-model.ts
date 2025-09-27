import type { LC, LiveElement } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import { GLTF, GLTFNodeData } from './types';

import { use, gather, memo, useMemo, useOne } from '@use-gpu/live';
import { GLTFNode } from './gltf-node';

export type GLTFModelProps = {
  gltf: GLTF,

  scene?: number,
  node?: number | string,
  nodes?: (number | string)[],
};

const NO_ROOTS: number[] = [];

const toArray = <T>(t?: T | T[] | null) => Array.isArray(t) ? t : t != null ? [t] : [];
const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

export const GLTFModel: LC<GLTFModelProps> = memo((props: GLTFModelProps) => {
  const {
    gltf,
    scene: propScene,
    node: propNode,
    nodes: propNodes,
  } = props;

  return useMemo(() => {
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

    // Render as GLTFNode
    return Array.from(roots).map(root => root != null ? use(GLTFNode, {gltf, node: root}) : null);
  }, [gltf, propNode, propScene]);
}, 'GLTFModel');
