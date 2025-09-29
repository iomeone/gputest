import type { LambdaSource, StorageSource, Lazy } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { ArrowFunction } from '@use-gpu/live';

import { resolve } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';

type GetProps = {
  length?: Lazy<number>,
  size?: Lazy<number[]>,
};

export const useLambdaSource = (shader: ShaderModule, getProps: GetProps) =>
  useMemo(() => getLambdaSource(shader, getProps), [shader, getProps]);

export const getLambdaSource = (shader: ShaderModule, getProps: GetProps) =>
  new Proxy({
    shader,
  }, {
    get: (target, s) => {
      if (s === 'length') {
        if (getProps.length) return resolve(getProps.length);
        if (getProps.size) return resolve(getProps.size).reduce((a, b) => a * b, 1);
        return 0;
      }
      if (s === 'size') {
        if (getProps.size) return resolve(getProps.size);
        if (getProps.length) return [resolve(getProps.length)];
        return [0];
      }
      return (target as any)[s];
    },
  }) as LambdaSource;