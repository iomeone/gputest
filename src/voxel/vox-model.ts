import type { LC } from '@use-gpu/live';
import type { Vox, VoxNodeTransform } from './types';

import { use, memo } from '@use-gpu/live';

import { VoxNode } from './vox-node';

export type VoxModelProps = {
  vox: Vox,
  name?: string,
  flat?: boolean,
};

export const VoxModel: LC<VoxModelProps> = memo((props: VoxModelProps) => {
  const {name, vox, flat} = props;
  const {nodes} = vox;

  const node = name ? nodes.find((node) => node.props._name === name) : nodes[0];
  const id = node?.id || (node as VoxNodeTransform).child;
  if (!id) return null;

  if (flat) {
    return nodes.filter((node) => node.type === 'shape').map((node) => use(VoxNode, {vox, id: node.id}));
  }

  return use(VoxNode, {vox, id});
}, 'VoxModel');
