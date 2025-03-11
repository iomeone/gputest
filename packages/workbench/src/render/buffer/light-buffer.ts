import type { LC } from '@use-gpu/live';
import type { PassBinding } from '../../pass/types';

import { yeet, memo } from '@use-gpu/live';

import lightBindingWGSL from '@use-gpu/wgsl/use/light.wgsl';

export const lightBinding: PassBinding = {
  module: lightBindingWGSL,
  bind: ({light}: PassEnv) => [light?.sources?.lightData],
};

const BINDINGS = {bindings: {light: lightBinding}};

export const LightBuffer: LC = memo(() => yeet(BINDINGS), 'LightBuffer');
