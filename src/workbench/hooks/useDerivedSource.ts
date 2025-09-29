import type { StorageSource } from '@use-gpu/core';

import { proxy } from '@use-gpu/core';
import { useOne } from '@use-gpu/live';

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

