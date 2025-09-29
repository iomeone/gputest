import type { ShaderModule } from '@use-gpu/shader';

import { makeContext, useContext } from '@use-gpu/live';

export type MaskContextProps = ShaderModule | null

export const MaskContext = makeContext<MaskContextProps>(null, 'MaskContext');

export const useMaskContext = () => useContext(MaskContext);
