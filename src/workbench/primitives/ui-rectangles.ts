import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, LambdaSource, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { ViewContext } from '../providers/view-provider';
import { Virtual } from './virtual';

import { patch } from '@use-gpu/state';
import { use, memo, useCallback, useMemo } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, bundleToAttributes } from '@use-gpu/shader/wgsl';
import { makeShaderBindings, resolve, BLEND_ALPHA } from '@use-gpu/core';
import { useTransformContext } from '../providers/transform-provider';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';

import { getUIRectangleVertex } from '@use-gpu/wgsl/instance/vertex/ui-rectangle.wgsl';
import { getUIFragment } from '@use-gpu/wgsl/instance/fragment/ui.wgsl';

export type UIRectanglesProps = {
  rectangle?: number[] | TypedArray,
  radius?: number[] | TypedArray,
  border?: number[] | TypedArray,
  stroke?: number[] | TypedArray,
  fill?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  repeat?: number,
  sdf?: number[] | TypedArray,

  rectangles?: ShaderSource,
  radiuses?: ShaderSource,
  borders?: ShaderSource,
  strokes?: ShaderSource,
  fills?: ShaderSource,
  uvs?: ShaderSource,
  repeats?: ShaderSource,
  sdfs?: ShaderSource,

  texture?: TextureSource | LambdaSource | ShaderModule,
  transform?: ShaderModule,
  clip?: ShaderModule,

  debugContours?: boolean,

  alphaToCoverage?: boolean,
  count?: Lazy<number>,
  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const VERTEX_BINDINGS = bundleToAttributes(getUIRectangleVertex);
const FRAGMENT_BINDINGS = bundleToAttributes(getUIFragment);

const DEFINES_ALPHA = {
  HAS_EDGE_BLEED: true,
  HAS_ALPHA_TO_COVERAGE: false,
  DEBUG_SDF: false,
};

const DEFINES_ALPHA_TO_COVERAGE = {
  HAS_EDGE_BLEED: true,
  HAS_ALPHA_TO_COVERAGE: true,
  DEBUG_SDF: false,
};

const PIPELINE_ALPHA = {
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

const PIPELINE_ALPHA_TO_COVERAGE = {
  fragment: {
    targets: {
      0: { blend: {$set: undefined}, },
    },
  },
  multisample: {
    alphaToCoverageEnabled: true,
  },
  primitive: {
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const UIRectangles: LiveComponent<UIRectanglesProps> = memo((props: UIRectanglesProps) => {
  const {
    pipeline: propPipeline,
    debugContours = false,
    alphaToCoverage = false,
    mode = 'opaque',
    id = 0,
    count = 1,
  } = props;

  const vertexCount = 4;
  const instanceCount = useCallback(() => ((props.rectangles as any)?.length ?? resolve(count)), [props.rectangles, count]);

  const pipeline = useMemo(() =>
    patch(alphaToCoverage
      ? PIPELINE_ALPHA_TO_COVERAGE
      : PIPELINE_ALPHA,
    propPipeline),
    [propPipeline, alphaToCoverage]);

  const r = useShaderRef(props.rectangle, props.rectangles);
  const a = useShaderRef(props.radius, props.radiuses);
  const b = useShaderRef(props.border, props.borders);
  const s = useShaderRef(props.strokes, props.strokes);
  const f = useShaderRef(props.fill, props.fills);
  const u = useShaderRef(props.uv, props.uvs);
  const p = useShaderRef(props.repeat, props.repeats);
  const d = useShaderRef(props.sdf, props.sdfs);

  const parent = useTransformContext();
  const x = props.transform || parent;
  const c = props.clip;
  const t = useNativeColorTexture(props.texture);

  const getVertex = useBoundShader(getUIRectangleVertex, VERTEX_BINDINGS, [r, a, b, s, f, u, p, d, x, c]);
  const getFragment = useBoundShader(getUIFragment, FRAGMENT_BINDINGS, [t]);

  let defines = alphaToCoverage ? DEFINES_ALPHA_TO_COVERAGE : DEFINES_ALPHA;
  if (debugContours) {
    defines = {...defines, DEBUG_SDF: true};
  }

  return use(Virtual, {
    vertexCount,
    instanceCount,

    getVertex,
    getFragment,

    defines,

    renderer: 'ui',
    pipeline,
    mode,
    id,
  });
}, 'UIRectangles');
