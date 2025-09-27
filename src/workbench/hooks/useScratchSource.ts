import type { LambdaSource, StorageSource, UniformType } from '../../core';
import type { ShaderModule } from '../../shader';
import type { ArrowFunction } from '../../live';

import { adjustSize } from './useBufferedSize';

import { resolve } from '../../core';
import { useMemo } from '../../live';

type InputSource = LambdaSource | StorageSource;

export const useScratchSource = (source: InputSource, format: UniformType, reserve?: number) => {

  /*
  const sizeRef = useOne(() => ({current: reserve || 16}));
  

  const [allocate, source, dims] = useMemo(() => {
    const f = (format && (format in UNIFORM_ARRAY_DIMS)) ? format as UniformType : 'f32';

    const allocate = () => {
      const 
      const buffer = makeStorageBuffer(device, array.byteLength);      
    };
    const {array, dims} = makeDataArray(f, l || 1);

    const buffer = makeStorageBuffer(device, array.byteLength);
    const source = {
      buffer,
      format: f,
      length: 0,
      size: [0],
      version: 0,
    };

    return [buffer, array, source, dims] as [GPUBuffer, TypedArray, StorageSource, number];
  }, [device, format, l]);
  */
  
}
