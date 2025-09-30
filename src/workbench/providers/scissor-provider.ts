import type { ShaderModule } from '../../shader';

import { makeContext, useContext, useNoContext } from '../../live';

export type ScissorContextProps = ShaderModule;

export const ScissorContext = makeContext<ScissorContextProps>(null, 'ScissorContext');

export const useScissorContext = () => useContext<ScissorContextProps | null>(ScissorContext);
export const useNoScissorContext = () => useNoContext(ScissorContext);
