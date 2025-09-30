import type { ShaderModule } from '@use-gpu/shader';

import { makeContext, useContext } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { DEFAULT_LIGHT_CONTEXT } from '../providers/light-provider';

import { getPassThruColor } from '@use-gpu/wgsl/mask/passthru.wgsl';

import { applyPBRMaterial } from '@use-gpu/wgsl/material/pbr-apply.wgsl';
import { getDefaultPBRMaterial } from '@use-gpu/wgsl/material/pbr-default.wgsl';

import { getLitFragment } from '@use-gpu/wgsl/instance/fragment/lit.wgsl';
import { getMaterialSurface } from '@use-gpu/wgsl/instance/surface/material.wgsl';

// Default PBR shader with built-in light
const getSurface = bindBundle(getMaterialSurface, {
  getMaterial: getDefaultPBRMaterial,
});
export const DEFAULT_MATERIAL_CONTEXT = {
  solid: {
    getFragment: getPassThruColor,
  },
  shaded: {
    getSurface,
    getLight: getLitFragment,
    applyLights: DEFAULT_LIGHT_CONTEXT.bindMaterial(applyPBRMaterial),
  },
};

export type MaterialContextProps = Record<string, Record<string, ShaderModule | null | undefined>>;

export const MaterialContext = makeContext<MaterialContextProps>(DEFAULT_MATERIAL_CONTEXT, 'MaterialContext');

export const useMaterialContext = () => useContext(MaterialContext);
