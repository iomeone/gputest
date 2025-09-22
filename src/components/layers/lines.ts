import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/types';

import { RawLines } from '../geometry/raw-lines';

import { use, memo, patch, useContext, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '@use-gpu/shader/glsl';
import { makeShaderBinding, makeShaderBindings, makeDataArray, makeStorageBuffer } from '@use-gpu/core';

import { RenderContext } from '@use-gpu/components';

/*
export type LinesProps = {
  position?: number[] | TypedArray,
  segment?: number,
  size?: number,
  color?: number[] | TypedArray,
  depth?: number,

  positions?: StorageSource,
  segments?: StorageSource,
  sizes?: StorageSource,
  colors?: StorageSource,
  depths?: number,

  getPosition?: ShaderModule,
  getSegment?: ShaderModule,
  getSize?: ShaderModule,
  getColor?: ShaderModule,
  getDepth?: ShaderModule,

  join?: 'miter' | 'round' | 'bevel',

  mode?: RenderPassMode | string,
  id?: number,
};

export const Lines: LiveComponent<LinesProps> = (props) => {
  return use(RawLines)(props);
};
*/

export const Lines = RawLines;