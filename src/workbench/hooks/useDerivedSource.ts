import type { LambdaSource, TextureSource, StorageSource } from '../../core';

import { proxy, lazy } from '../../core';
import { useOne, useNoOne, useRef, useNoRef } from '../../live';

export const useDerivedSource = <T extends TextureSource | StorageSource | LambdaSource>(
  source: T,
  override: Record<string, any>,
): T => {
  const overrideRef = useRef(override);
  overrideRef.current = override;

  return useOne(() => source ? lazy(source, overrideRef) : null as any, source);
};

export const getDerivedSource = <T extends TextureSource | StorageSource | LambdaSource>(
  source: T,
  override: Record<string, any>,
): T => {
  return source ? proxy(source, override) : null as any;
};

export const useNoDerivedSource = () => {
  useNoRef();
  useNoOne();
};
