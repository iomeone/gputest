import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/types';

import { UIRectangles } from '../geometry/ui-rectangles';

import { use, memo, patch, useContext, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '@use-gpu/shader/glsl';
import { makeShaderBinding, makeShaderBindings, makeDataArray, makeStorageBuffer } from '@use-gpu/core';

import { RenderContext } from '@use-gpu/components';

/*
export type RectanglesProps = {
  rectangle?: number[] | TypedArray,
  color?: number[] | TypedArray,
  mask?: number,
  texture?: any,

  rectangles?: StorageSource,
  colors?: StorageSource,
  masks?: number,
  textures?: StorageSource,

  getRectangle?: ShaderModule,
  getColor?: ShaderModule,
  getMask?: ShaderModule,
  getTexture?: ShaderModule,

  mode?: RenderPassMode | string,
  id?: number,
};

export const Rectangles: LiveComponent<RectanglesProps> = (props) => {
  return use(RawRectangles)(props);
};
*/

export const Rectangles = UIRectangles;