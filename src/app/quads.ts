import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ViewContext, PickingContext, useNoPicking, Virtual } from '@use-gpu/components';
import { use, memo, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { makeMultiUniforms, makeUniformsWithStorage, makeRenderPipeline, extractPropBindings, uploadBuffer } from '@use-gpu/core';
import { useBoundStorageShader } from '@use-gpu/components';

import { getQuadVertex } from '@use-gpu/glsl/instance/vertex/quad.glsl';

export type QuadsProps = {
  position?: number[] | TypedArray,
  size?: number,
  color?: number[],

  positions?: StorageSource,
  sizes?: StorageSource,
  colors?: StorageSource,

  getMask?: ParsedBundle | ParsedModule,
  
  mode?: RenderPassMode | string,
  id?: number,
};

const ZERO = [0, 0, 0, 1];
const GRAY = [0.5, 0.5, 0.5, 1];

const ATTRIBUTES = [
  { name: 'getPosition', format: 'vec4', value: ZERO },
  { name: 'getColor', format: 'vec4', value: GRAY },
  { name: 'getSize', format: 'float', value: 1 },
] as UniformAttributeValue[];

const LAMBDAS = [
  { name: 'getMask', format: 'float', args: ['vec2'], value: 0.5 },
  { name: 'getTexture', format: 'vec4', args: ['vec2'], value: [1.0, 1.0, 1.0, 1.0] },
] as UniformAttributeValue[];

const DEFINES = {
  HAS_MASK: true,
  HAS_TEXTURE: true,
  HAS_EDGE_BLEED: true,
  STRIP_SEGMENTS: 2,
};

const LINKS = {
  'getVertex': getQuadVertex,
};

export const Quads: LiveComponent<QuadsProps> = memo((fiber) => (props) => {
  const {
    mode = RenderPassMode.Render,
    id = 0,
  } = props;

  const vertexCount = 4;
  const instanceCount = props.positions?.length || 1;

  const [attrBindings, lambdaBindings] = useOne(() => [
    [
      props.positions ?? props.position,
      props.colors ?? props.color,
      props.sizes ?? props.size,
    ],
    [
      props.getMask,
      props.getTexture,
    ],
  ], props);

  return use(Virtual)({
    topology: 'triangle-strip',
    vertexCount,
    instanceCount,

    attrBindings,
    lambdaBindings,
    
    attributes: ATTRIBUTES,
    lambdas: LAMBDAS,
    links: LINKS,
    defines: DEFINES,
    deps: null,

    mode,
    id,
  });
}, 'Quads');
