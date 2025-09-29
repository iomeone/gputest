import type { StorageSource, LambdaSource, TypedArray } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import { makeContext, useContext } from '@use-gpu/live';

export type DataContextProps = StorageSource | LambdaSource | ShaderModule | null;
export type ValuesContextProps = number[] | TypedArray;

/**
 * Provides a shader source for current data
 * @category Providers
 */
export const DataContext = makeContext<DataContextProps>(undefined, 'DataContext');

/**
 * Provides a typed array for current data 
 * @category Providers
 */
export const ValuesContext = makeContext<ValuesContextProps>(undefined, 'ValuesContext');

/** @category Providers */
export const useDataContext = () => useContext<DataContextProps>(DataContext);

/** @category Providers */
export const useValuesContext = () => useContext<ValuesContextProps>(ValuesContext);
