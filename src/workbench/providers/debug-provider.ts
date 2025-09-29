import type { DeepPartial, StorageSource, LambdaSource, TypedArray } from '../../core';
import type { ShaderModule } from '../../shader';
import type { LC, PropsWithChildren } from '../../live';

import { provide, memo, makeContext, useContext, useMemo } from '../../live';
import { patch } from '../../state';

export const DEBUG_DEFAULTS = {
  voxel: {
    iterations: false,
  },
  sdf2d: {
    contours: false,
    subpixel: true,
    solidify: true,
    preprocess: false,
    postprocess: false,
  },
  layout: {
    inspect: false,
  }
} as DebugContextProps;

export type DebugContextProps = {
  voxel: {
    iterations: boolean,
  },
  sdf2d: {
    contours: boolean,
    subpixel: boolean,
    solidify: boolean,
    preprocess: boolean,
    postprocess: boolean,
  },
  layout: {
    inspect: boolean,
  },
};

export type DebugProviderProps = {
  debug: DeepPartial<DebugContextProps>,
};

export const DebugContext = makeContext<DebugContextProps>(DEBUG_DEFAULTS, 'DebugContext');
export const useDebugContext = () => useContext(DebugContext);

export const DebugProvider: LC<DebugProviderProps> = memo(({debug, children}: PropsWithChildren<DebugProviderProps>) => {
  const parent = useContext(DebugContext);
  const context = useMemo(() => patch(parent, debug), [parent, debug]);
  return provide(DebugContext, context, children);
}, 'DebugProvider');
