import type { OffscreenTarget, TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';
import { useBoundShader, useNoBoundShader } from '../hooks/useBoundShader';

import { getPickingID } from '@use-gpu/wgsl/render/pick.wgsl';

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
}

export const usePickingShader = ({id, ids, lookup, lookups}: PickingSource) => 
  id ?? ids ? useBoundShader(getPickingID, [id ?? ids, lookup ?? lookups]) : useNoBoundShader();
