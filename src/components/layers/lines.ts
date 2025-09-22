import { LiveComponent } from '../../live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '../../core/types';
import { ShaderModule } from '../../shader/types';

import { RawLines } from '../geometry/raw-lines';

import { use, memo, patch, useContext, useMemo, useOne, useState, useResource } from '../../live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '../../shader/glsl';
import { makeShaderBinding, makeShaderBindings, makeDataArray, makeStorageBuffer } from '../../core';

import { RenderContext } from '../../components';

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