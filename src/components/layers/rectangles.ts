import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ShaderModule } from '@use-gpu/shader/types';

import { UIRectangles } from '../geometry/ui-rectangles';

import { patch } from '@use-gpu/state';
import { use, memo, useContext, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '@use-gpu/shader/glsl';
import { makeShaderBinding, makeShaderBindings, makeDataArray, makeStorageBuffer } from '@use-gpu/core';

import { RenderContext } from '@use-gpu/components';

export const Rectangles = UIRectangles;