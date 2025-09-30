import type { ShaderSource } from '@use-gpu/shader';

import { useOne } from '@use-gpu/live';
import { useShader, useNoShader } from '../../hooks/useShader';

import { getPickingID } from '@use-gpu/wgsl/render/lookup/pick.wgsl';

export type PickingSource = {
  id?: number,
  lookup?: number,
  ids?: ShaderSource,
  lookups?: ShaderSource,
  uvPicking?: boolean,
};

export const usePickingShader = ({id, ids, lookup, lookups, uvPicking}: PickingSource) => {
  const defs = useOne(() => ({UV_PICKING: !!uvPicking}), uvPicking);
  return ids ?? id ? useShader(getPickingID, [ids ?? id, lookup ?? lookups], defs) : (useNoShader(), undefined);
};
