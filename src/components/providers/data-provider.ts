import { StorageSource, LambdaSource, TypedArray } from '../../core/types';
import { ShaderModule } from '../../shader/wgsl/types';
import { makeContext, useContext } from '../../live';

export type DataContextProps = StorageSource | LambdaSource | ShaderModule | null;
export type ValuesContextProps = number[] | TypedArray;

export const DataContext = makeContext<DataContextProps>(undefined, 'DataContext');
export const ValuesContext = makeContext<ValuesContextProps>(undefined, 'ValuesContext');

export const useDataContext = () => useContext<DataContextProps>(DataContext);
export const useValuesContext = () => useContext<ValuesContextProps>(ValuesContext);
