import type { OffscreenTarget, TextureSource } from '../../core';
import type { ShaderSource } from '../../shader';
import { makeContext, useContext, useNoContext } from '../../live';
import { useBoundShader, useNoBoundShader } from '../hooks/useBoundShader';

import { getPickingID } from '../../gen-wgsl/render/pick';

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
