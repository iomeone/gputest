import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource, LambdaSource, UniformType } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { VectorLike } from '@use-gpu/traits';
import type { ScaleTrait, AxisTrait } from '../types';

import { parseVec4, useProp } from '@use-gpu/traits';
import { yeet, provide, useOne, useMemo, useNoMemo, useContext, incrementVersion } from '@use-gpu/live';
import { useRawSource, useBoundShader, useShaderRef } from '@use-gpu/workbench';

import { DataContext, ValuesContext } from '../providers/data-provider';
import { RangeContext } from '../providers/range-provider';

import { useScaleTrait, useAxisTrait } from '../traits';
import { logarithmic, linear } from '../util/domain';

import { getScalePosition } from '@use-gpu/wgsl/plot/scale.wgsl';

import { vec4 } from 'gl-matrix';

export type ScaleProps = Partial<ScaleTrait> & Partial<AxisTrait> & {
  origin?: VectorLike,
  render?: (positions: LambdaSource, values: Float32Array) => LiveElement,
};

export const Scale: LiveComponent<ScaleProps> = (props: PropsWithChildren<ScaleProps>) => {

  const {
    origin,
    render,
    children,
  } = props;

  const {axis, range} = useAxisTrait(props);
  const domainOptions = useScaleTrait(props);

  const parentRange = useContext(RangeContext);
  const r = range ?? parentRange[axis];
  const p = useProp(origin, parseVec4);

  // Generate tick scale
  const newValues = useMemo(() => {
    const f = (props.mode === 'log') ? logarithmic : linear;
    return new Float32Array(f(r[0], r[1], domainOptions));
  }, [r[0], r[1], props]);

  const values = useMemo(() => newValues, newValues as any);
  const data = useRawSource(values, 'f32');
  const n = values.length;

  // Make tick vertex shader
  const og = vec4.clone(p as any);
  og[axis] = 0;

  const o = useShaderRef(og);
  const a = useShaderRef(axis);
  const bound = useBoundShader(getScalePosition, [data, a, o]);

  // Expose position source
  const source = useMemo(() => ({
    shader: bound,
    alloc: (data as any).alloc,
    length: n,
    size: [n],
    version: 0,
  }), [bound]);

  useOne(() => {
    source.length = n;
    source.size[0] = n;
  }, n);

  useOne(() => {
    source.version = incrementVersion(source.version);
  }, values);

  return useMemo(() => {
    if (render == null && children === undefined) return yeet(source);
    return (
      provide(ValuesContext, values,
        provide(DataContext, source, render != null ? render(source, values) : children)
      )
    );
  }, [render, children, source, values]);
}
