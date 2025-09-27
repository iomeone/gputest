import { StorageSource, LambdaSource, TypedArray } from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/wgsl/types';
import { makeContext, useContext } from '@use-gpu/live';

export type DataContextProps = StorageSource | LambdaSource | ShaderModule | null;
export type ValuesContextProps = number[] | TypedArray;

export const DataContext = makeContext<DataContextProps>(undefined, 'DataContext');
export const ValuesContext = makeContext<ValuesContextProps>(undefined, 'ValuesContext');

export const useDataContext = () => useContext<DataContextProps>(DataContext);
export const useValuesContext = () => useContext<ValuesContextProps>(ValuesContext);
