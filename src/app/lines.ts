import { LiveComponent } from '@use-gpu/live/types';
import {
    TypedArray, ViewUniforms,
    UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
    VertexData, StorageSource, RenderPassMode,
} from '@use-gpu/core/types';
import { ViewContext, PickingContext, useNoPicking, Virtual } from '@use-gpu/components';
import { use, yeet, memo, useMemo, useOne, useState, useResource } from '@use-gpu/live';

import { getLineVertex } from '@use-gpu/glsl/instance/vertex/line.glsl';

export type LinesProps = {
  position?: number[] | TypedArray,
  segment?: number,
  size?: number,

  positions?: StorageSource,
  segments?: StorageSource,
  sizes?: StorageSource,

  depth?: number,
  join: 'miter' | 'round' | 'bevel',

  mode?: RenderPassMode,
  id?: number,
};

const ZERO = [0, 0, 0, 1];

const ATTRIBUTES = [
  { name: 'getPosition', format: 'vec4', value: ZERO },
  { name: 'getSegment', format: 'int', value: 0 },
  { name: 'getSize', format: 'float', value: 1 },
] as UniformAttributeValue[];

const LAMBDAS = [] as UniformAttributeValue[];

const LINKS = {
  'getVertex': getLineVertex,
};

const LINE_JOIN_SIZE = {
  'bevel': 1,
  'miter': 2,
  'round': 4,
};

const LINE_JOIN_STYLE = {
  'bevel': 0,
  'miter': 1,
  'round': 2,
};

export const Lines: LiveComponent<LinesProps> = memo((fiber) => (props) => {
  const {
    mode = RenderPassMode.Render,
    id = 0,
  } = props;

  // Customize line shader
  let {join, depth = 0} = props;
  join = join in LINE_JOIN_SIZE ? join : 'bevel';

  const style = LINE_JOIN_STYLE[join];
  const segments = LINE_JOIN_SIZE[join];
  const tris = (1+segments) * 2;
  const defines = {
    LINE_JOIN_STYLE: style,
    LINE_JOIN_SIZE: segments,
    STRIP_SEGMENTS: tris,
  };

  // Set up draw
  const vertexCount = tris * 3;
  const instanceCount = (props.positions?.length || 2) - 1;

  // Bind to shader
  const [attrBindings, lambdaBindings] = useOne(() => [
    [
      props.positions ?? props.position,
      props.segments ?? props.segment,
      props.sizes ?? props.size,
    ],
    [],
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
    defines,
    deps: [join],

    mode,
    id,
  });
}, 'Lines');
