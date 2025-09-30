import type { ShaderModule } from '../../shader';

import { makeContext, useContext, useNoContext } from '../../live';
import { bindBundle } from '../../shader/wgsl';

import { DEFAULT_LIGHT_CONTEXT } from '../providers/light-provider';

import { getPassThruColor } from '../../wgsl/mask/passthruwgsl';

import { applyPBRMaterial } from '../../wgsl/material/pbr-applywgsl';
import { getDefaultPBRMaterial } from '../../wgsl/material/pbr-defaultwgsl';

import { getLitFragment } from '../../wgsl/instance/fragment/litwgsl';
import { getMaterialSurface } from '../../wgsl/instance/surface/material-surfacewgsl';

// Default PBR shader with built-in light
const getSurface = bindBundle(getMaterialSurface, {
  getMaterial: getDefaultPBRMaterial,
});
export const DEFAULT_MATERIAL_CONTEXT = {
  solid: {
    getFragment: getPassThruColor,
  },
  shaded: {
    getFragment: getPassThruColor,
    getSurface,
    getLight: getLitFragment,
    applyLights: DEFAULT_LIGHT_CONTEXT.bindApplyMaterial(applyPBRMaterial),
  },
};

export type MaterialContextProps = Record<string, Record<string, ShaderModule | null | undefined>>;

export const MaterialContext = makeContext<MaterialContextProps>(DEFAULT_MATERIAL_CONTEXT, 'MaterialContext');

export const useMaterialContext = () => useContext(MaterialContext);
export const useNoMaterialContext = () => useNoContext(MaterialContext);
