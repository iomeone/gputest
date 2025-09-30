import type { TensorArray } from '@use-gpu/core';
import { makeContext, useContext } from '@use-gpu/live';

export type DataContextProps = Record<string, TensorArray>;

/**
 * Provides a dictionary of tensor arrays for current data context
 */
export const DataContext = makeContext<DataContextProps>({}, 'DataContext');

export const useDataContext = () => useContext<DataContextProps>(DataContext);
