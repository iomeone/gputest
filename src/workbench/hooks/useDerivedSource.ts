import type { StorageSource } from '../../core';

import { proxy } from '../../core';
import { useOne } from '../../live';

export const useDerivedSource = (
  source: StorageSource,
  override: Record<string, any>,
) => {
  return useOne(() => getDerivedSource(source, override), source);
};

export const getDerivedSource = (
  source: StorageSource,
  override: Record<string, any>,
) => {
  return proxy(source, override);
};

