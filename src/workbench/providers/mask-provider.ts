import type { ShaderModule } from '../../shader';

import { makeContext, useContext } from '../../live';

export type MaskContextProps = ShaderModule | null

export const MaskContext = makeContext<MaskContextProps>(null, 'MaskContext');

export const useMaskContext = () => useContext(MaskContext);
