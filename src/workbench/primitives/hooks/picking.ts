import type { ShaderSource } from '../../../shader';

import { useOne } from '../../../live';
import { useShader, useNoShader } from '../../hooks/useShader';

import { getPickingID } from '../../../wgsl/render/lookup/pick.wgsl';

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
