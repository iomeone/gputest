import type { StorageTarget, TextureTarget } from '../../core';

import { makeContext, useContext, useNoContext } from '../../live';

export type ComputeContextProps = (StorageTarget | TextureTarget)[];

export const ComputeContext = makeContext<ComputeContextProps>(undefined, 'ComputeContext');

export const useComputeContext = () => useContext<ComputeContextProps>(ComputeContext);
export const useNoComputeContext = () => useNoContext(ComputeContext);
