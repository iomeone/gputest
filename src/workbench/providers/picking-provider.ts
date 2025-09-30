import type { OffscreenTarget } from '../../core';
import type { ShaderSource } from '../../shader';
import { makeContext, useOne, useContext, useNoContext } from '../../live';
import { useShader, useNoShader } from '../hooks/useShader';

import { getPickingID } from '../../wgsl/render/pick.wgsl';

export type PickingContextProps = {
  renderContext: OffscreenTarget,
  captureTexture: () => void,
  sampleTexture: (x: number, y: number) => number[],
};

export const PickingContext = makeContext<PickingContextProps>(undefined, 'PickingContext');

export const usePickingContext = () => useContext<PickingContextProps>(PickingContext);
export const useNoPickingContext = () => useNoContext(PickingContext);

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
