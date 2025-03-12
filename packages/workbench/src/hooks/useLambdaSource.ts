import type { ColorSpace, LambdaSource, Lazy, TypedArray } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { resolve } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';

export type SourceLike = {
  length?: Lazy<number>,
  size?: Lazy<number[] | TypedArray>,
  colorSpace?: ColorSpace,
  
  texture?: { label?: string },
  label?: string,
};

export const useLambdaSource = (shader: ShaderModule, sourceProps: SourceLike) =>
  useMemo(() => getLambdaSource(shader, sourceProps), [shader, sourceProps]);

export const getLambdaSource = (shader: ShaderModule, sourceProps: SourceLike) =>
  new Proxy({
    shader,
  }, {
    get: (target, s) => {
      if (s === 'length') {
        if (sourceProps.length != null) return resolve(sourceProps.length);
        if (sourceProps.size != null) return (resolve(sourceProps.size) as number[]).reduce((a, b) => a * b, 1);
        return 0;
      }
      if (s === 'size') {
        if (sourceProps.size != null) return resolve(sourceProps.size);
        if (sourceProps.length != null) return [resolve(sourceProps.length)];
        return [0];
      }
      if (s === 'label') return target.label ?? sourceProps.view?.label ?? sourceProps.texture?.label ?? sourceProps.label;
      if (s === 'colorSpace') return target.colorSpace ?? sourceProps.colorSpace;
      if (s === 'format') return target.format ?? sourceProps.format;
      if (s === 'layout') return target.layout ?? sourceProps.layout;
      return (target as any)[s];
    },
  }) as LambdaSource;
