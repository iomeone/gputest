import type { ShaderSource } from '@use-gpu/shader';
import { useOne, useNoOne } from '@use-gpu/live';

export const useShaderRef = <T>(value?: T, source?: ShaderSource) => {
  if (source) {
    useNoOne();
    return source;
  }
  if ((value as any)?.current != null) {
    useNoOne();
    return value;
  }
  if (value == null) {
    useNoOne();
    return value;
  }
  if (typeof value === 'function') {
    useNoOne();
    return value;
  }
  const ref = useOne(() => ({current: value}));
  ref.current = value;
  return ref;
};
