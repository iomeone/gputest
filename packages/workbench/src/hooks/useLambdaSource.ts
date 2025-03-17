import type { ColorSpace, LambdaSource, Lazy, TypedArray, UniformFormat } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { notEmptyString, resolve } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';
import { getObjectKey } from '@use-gpu/state';

export type SourceLike = Partial<{
  length: Lazy<number>,
  size: Lazy<number[] | TypedArray>,

  texture: { label?: string },
  view: { label?: string },
  format: UniformFormat | string,
  layout: string,
  colorSpace: ColorSpace,

  label: string,
  id: string,
}>;

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
      if (s === 'label') return (
        notEmptyString(sourceProps.label) ??
        notEmptyString(sourceProps.view?.label) ??
        notEmptyString(sourceProps.texture?.label)
      );
      if (s === 'colorSpace') return sourceProps.colorSpace;
      if (s === 'format') return sourceProps.format;
      if (s === 'layout') return sourceProps.layout;
      if (s === 'id') return sourceProps.id ?? getObjectKey(sourceProps.view ?? sourceProps.texture);
      return (target as any)[s];
    },
  }) as LambdaSource;
