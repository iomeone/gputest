import type { Lazy } from '@use-gpu/core';
import type { UniformAttribute, ShaderSource } from '@use-gpu/shader';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';
import { resolve } from '@use-gpu/core';
import { useMemo, useOne } from '@use-gpu/live';

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

const NO_OFFSET = [0, 0, 0, 0];

export const useDataSize = (
  size?: Lazy<number[]> | null,
  source?: ShaderSource | null,
  offset: number[] = NO_OFFSET,
): Lazy<number[]> =>
  useMemo(() => () => {
    const s = (source as any)?.size ?? resolve(size) ?? [];
    return [
      Math.max(0, (s[0] || 1) + offset[0]),
      Math.max(0, (s[1] || 1) + offset[1]),
      Math.max(0, (s[2] || 1) + offset[2]),
      Math.max(0, (s[3] || 1) + offset[3]),
    ];
  }, [size, source]);

export const useDataLength = (
  length?: Lazy<number> | null,
  source?: ShaderSource | null,
  extra: number = 0,
): Lazy<number> =>
  useMemo(() => () => Math.max(0, (
    length != null ? resolve(length) :
    ((source as any)?.length ?? 0)
  ) + extra), [length, source, extra]);
