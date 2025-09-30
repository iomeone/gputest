import type { ShaderModule } from '../../shader';

import { makeContext, useContext } from '../../live';

export type EnvironmentContextProps = ShaderModule | null;

export const EnvironmentContext = makeContext<EnvironmentContextProps>(null, 'EnvironmentContext');

export const useEnvironmentContext = () => useContext(EnvironmentContext);
