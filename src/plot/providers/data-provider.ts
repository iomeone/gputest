import type { TensorArray } from '../../core';
import { makeContext, useContext } from '../../live';

export type DataContextProps = Record<string, TensorArray>;

/**
 * Provides a dictionary of tensor arrays for current data context
 */
export const DataContext = makeContext<DataContextProps>({}, 'DataContext');

export const useDataContext = () => useContext<DataContextProps>(DataContext);
