import type { UniformAttribute, ShaderSource } from '@use-gpu/shader';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';
import { useOne } from '@use-gpu/live';

// Extract type and size from a source
export const useDataBinding = (
  source: ShaderSource,
): [UniformAttribute, () => number, () => number[]] => {
  const length = useOne(() => () => (source as any)?.length || 0, source);

  const size = useOne(() => () => {
    const s = (source as any)?.size || [];
    return [s[0] || 1, s[1] || 1, s[2] || 1, s[3] || 1];
  }, source);

  const binding = useOne(() => {
    if ('format' in source) return {name: 'getValue', format: source.format, args: ['u32']};
    if ('shader' in source) return bundleToAttribute(source.shader);
    return bundleToAttribute(source);
  }, source);

  return [binding, length, size];
}

