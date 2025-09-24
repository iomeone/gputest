import { LiveComponent } from '../../live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '../../core/types';
import { ShaderModule } from '../../shader/types';

import { UIRectangles } from '../geometry/ui-rectangles';

import { patch } from '../../state';
import { use, memo, useContext, useMemo, useOne, useState, useResource } from '../../live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '../../shader/glsl';
import { makeShaderBinding, makeShaderBindings, makeDataArray, makeStorageBuffer } from '../../core';

import { RenderContext } from '../../components';

export const Rectangles = UIRectangles;