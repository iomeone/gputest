import type { ShaderModule } from '../../shader';

import { makeContext, useContext } from '../../live';
import { parseColor, useProp } from '../../traits';
import { bindBundle } from '../../shader/wgsl';

import { DEFAULT_LIGHT_CONTEXT } from '../providers/light-provider';

import { getPassThruColor } from '../../gen-wgsl/mask/passthru';

import { getDefaultPBRMaterial } from '../../gen-wgsl/material/pbr-default';
import { applyPBRMaterial } from '../../gen-wgsl/material/pbr-apply';

import { getShadedFragment } from '../../gen-wgsl/instance/fragment/shaded';
import { getMaterialSurface } from '../../gen-wgsl/instance/surface/material';

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
