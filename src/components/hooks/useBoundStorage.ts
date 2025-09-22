import {
  ShaderLanguages, ShaderLib,
  ResolvedDataBindings, ResolvedCodeBindings,
  UniformAttribute,
} from '@use-gpu/core/types';
import { makeBoundStorageAccessors, makeBoundShader } from '@use-gpu/core';
import { linkCode as link } from '@use-gpu/shader';
import partition from 'lodash/partition';

import { useMemo, useOne } from '@use-gpu/live';

export const useBoundStorage = <T>(
  dataUniforms: UniformAttribute[],
  codeUniforms: UniformAttribute[],
  dataBindings: ResolvedDataBindings,
  codeBindings: ResolvedCodeBindings<T>,
  base: number = 0,
) => {
  const {links, constants} = dataBindings;

  // Storage only needs to change if arrangement of links vs constants changes.
  const storageKeys = [...Object.keys(dataBindings), ...Object.keys(codeBindings)];
  const memoKey = useMemo(() => Math.random(), storageKeys);

  return useOne(() => makeBoundStorageAccessors(dataUniforms, codeUniforms, dataBindings, codeBindings, base), memoKey);
};
