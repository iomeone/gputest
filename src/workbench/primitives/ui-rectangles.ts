import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, LambdaSource,
} from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { Virtual } from './virtual';

import { use, memo, useCallback, useMemo, useOne } from '@use-gpu/live';
import { getBundleKey } from '@use-gpu/shader/wgsl';
import { resolve } from '@use-gpu/core';
import { useCombinedTransform } from '../hooks/useCombinedTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';
import { useDataLength } from '../hooks/useDataBinding';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { usePickingShader } from '../providers/picking-provider';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getUIRectangleVertex } from '@use-gpu/wgsl/instance/vertex/ui-rectangle.wgsl';
import { getUIFragment } from '@use-gpu/wgsl/instance/fragment/ui.wgsl';

export type UIRectanglesProps = {
  rectangle?: number[] | TypedArray,
  radius?: number[] | TypedArray,
  border?: number[] | TypedArray,
  stroke?: number[] | TypedArray,
  fill?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  st?: number[] | TypedArray,
  repeat?: number,
  sdf?: number[] | TypedArray,

  rectangles?: ShaderSource,
  radiuses?: ShaderSource,
  borders?: ShaderSource,
  strokes?: ShaderSource,
  fills?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  repeats?: ShaderSource,
  sdfs?: ShaderSource,

  texture?: TextureSource | LambdaSource | ShaderModule,
  transform?: ShaderModule,
  clip?: ShaderModule,
  mask?: ShaderSource,

  debugContours?: boolean,

  count?: Lazy<number>,
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

export const UIRectangles: LiveComponent<UIRectanglesProps> = memo((props: UIRectanglesProps) => {
  const {
    id = 0,
    count = 1,
    mode = 'transparent',
    alphaToCoverage = false,
    depthTest,
    depthWrite,
    blend,
    
    texture,
    transform,
    clip,
    mask,
    
    debugContours = false,
  } = props;

  const vertexCount = 4;
  const instanceCount = useDataLength(count, props.rectangles);

  const r = useShaderRef(props.rectangle, props.rectangles);
  const a = useShaderRef(props.radius, props.radiuses);
  const b = useShaderRef(props.border, props.borders);
  const s = useShaderRef(props.stroke, props.strokes);
  const f = useShaderRef(props.fill, props.fills);
  const u = useShaderRef(props.uv, props.uvs);
  const v = useShaderRef(props.st, props.sts);
  const p = useShaderRef(props.repeat, props.repeats);
  const d = useShaderRef(props.sdf, props.sdfs);

  const {transform: xf} = useCombinedTransform(transform);
  const c = clip;
  const m = mask;
  const t = useNativeColorTexture(texture);

  const getVertex = useBoundShader(getUIRectangleVertex, [r, a, b, s, f, u, v, p, d, xf, c]);
  const getPicking = usePickingShader(props);
  const getFragment = useBoundShader(getUIFragment, [t, m]);

  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
  });

  const defines: Record<string, any> = useMemo(() => ({
    ...defs,
    HAS_EDGE_BLEED: true,
    HAS_MASK: !!mask,
    DEBUG_SDF: debugContours,
  }), [defs, debugContours, mask]);

  return use(Virtual, {
    vertexCount,
    instanceCount,

    links,
    defines,

    renderer: 'ui',
    pipeline,
    mode,
  });
}, 'UIRectangles');
