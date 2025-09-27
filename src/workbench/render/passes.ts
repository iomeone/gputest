import { yeet, useContext } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { ViewContext } from '../providers/view-provider';
import { PickingContext } from './picking';

/*
export const ColorPass = () => {
  const renderContext = useContext(RenderContext);
  const {viewUniforms, viewDefs} = useContext(ViewContext);

  return yeet({
    renderContext,
    uniforms: {
      defs: [viewDefs],
      uniforms: [viewUniforms],
    },
  })
};

export const GPUPickingPass = () => {
  const pickingContext = useContext(PickingContext);
  if (!pickingContext) return null;

  yeet({
    uniforms: {
      defs: [viewDefs, pic],
      uniforms: [viewUniforms],
    },
  })
};
*/