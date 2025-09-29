import type { ShaderModule } from '../../shader';

import { makeContext, useContext } from '../../live';
import { parseColor, useProp } from '../../traits';
import { bindBundle } from '../../shader/wgsl';

import { DEFAULT_LIGHT_CONTEXT } from '../providers/light-provider';

import { getPassThruColor } from '../../wgsl/mask/passthruwgsl';

import { getDefaultPBRMaterial } from '../../wgsl/material/pbr-defaultwgsl';
import { applyPBRMaterial } from '../../wgsl/material/pbr-applywgsl';

import { getShadedFragment } from '../../wgsl/instance/fragment/shadedwgsl';
import { getMaterialSurface } from '../../wgsl/instance/surface/materialwgsl';

// Default PBR shader with built-in light
const getSurface = bindBundle(getMaterialSurface, {
  getMaterial: getDefaultPBRMaterial,
});
const getLight = bindBundle(getShadedFragment, {
  applyLights: DEFAULT_LIGHT_CONTEXT.bindMaterial(applyPBRMaterial),
});
export const DEFAULT_MATERIAL_CONTEXT = {
  solid: {
    getFragment: getPassThruColor,
  },
  shaded: {
    getSurface,
    getLight,
  },
};

export type MaterialContextProps = Record<string, Record<string, ShaderModule | null | undefined>>;

export const MaterialContext = makeContext<MaterialContextProps>(DEFAULT_MATERIAL_CONTEXT, 'MaterialContext');

export const useMaterialContext = () => useContext(MaterialContext);
