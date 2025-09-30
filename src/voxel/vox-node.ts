import type { LC } from '@use-gpu/live';
import type { Vox, VoxNodeTransform, VoxNodeGroup, VoxNodeShape } from './types';

import { use, memo } from '@use-gpu/live';
import { Node, Primitive } from '@use-gpu/scene';

import { mat4 } from 'gl-matrix';

import { VoxLayer } from './vox-layer';

export type VoxNodeProps = {
  vox: Vox,
  id: number,
};

export const VoxNode: LC<VoxNodeProps> = memo((props: VoxNodeProps) => {
  const {id, vox} = props;
  const {nodes} = vox;

  const node = nodes[id];
  const {type} = node;

  if (type === 'transform') {
    const {child, frame} = node as VoxNodeTransform;
    return use(Node, {
      matrix: frame as mat4,
      children: use(VoxNode, {vox, id: child}),
    });
  }
  else if (type === 'group') {
    return (node as VoxNodeGroup).children.map((id) => use(VoxNode, {vox, id}));
  }
  else if (type === 'shape') {
    const {model: {id}} = node as VoxNodeShape;
    const {bound: {shapes, palette, pbr}} = vox;
    const shape = shapes[id];
    return use(Primitive, {children: use(VoxLayer, {shape, palette, pbr})});
  }

  return null;
}, 'VoxNode');
