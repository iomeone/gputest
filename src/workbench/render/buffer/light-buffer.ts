import type { LC } from '../../../live';
import type { PassBinding, PassEnv } from '../../pass/types';

import { yeet, memo } from '../../../live';

import lightBindingWGSL from '../../../wgsl/use/lightwgsl';

export const lightBinding: PassBinding = {
  module: lightBindingWGSL,
  bind: ({light}: PassEnv) => [light?.sources?.lightData],
};

const BINDINGS = {bindings: {light: lightBinding}};

export const LightBuffer: LC = memo(() => yeet(BINDINGS), 'LightBuffer');
