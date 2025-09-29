import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, LambdaSource,
} from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { Virtual } from './virtual';

import { use, yeet, memo, useOne, useNoOne, useRef } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, getBundleKey } from '@use-gpu/shader/wgsl';
import { makeShaderBindings } from '@use-gpu/core';

import { useBoundShader } from '../hooks/useBoundShader';
import { usePickingShader } from '../providers/picking-provider';
import { useRenderContext, useNoRenderContext } from '../providers/render-provider';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';
import { getTextureColor } from '@use-gpu/wgsl/mask/textured.wgsl';

export type RawFullScreenProps = {
  texture?: TextureSource | LambdaSource | ShaderModule,
  filter?: ShaderModule,
  initial?: boolean,

  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'alphaToCoverage' | 'blend'>;

const ZERO = [0, 0, 0, 1];

export const RawFullScreen: LiveComponent<RawFullScreenProps> = memo((props: RawFullScreenProps) => {
  const {
    mode = 'opaque',
    alphaToCoverage,
    blend,
    id = 0,
    initial = false,
  } = props;

  const vertexCount = 3;
  const instanceCount = 1;

  const t = useNativeColorTexture(props.texture, props.filter);

  const getVertex = getFullScreenVertex;
  const getPicking = usePickingShader({id});
  const getFragment = useBoundShader(getTextureColor, [t]);
  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const renderContext = initial ? useRenderContext() : useNoRenderContext(); 
  let first = useRef(true);
  initial ? useOne(() => { first.current = true; }, renderContext) : useNoOne();

  const shouldDispatch = initial ? () => {
    if (!first.current) return false;
    first.current = false;
  } : undefined;

  const [pipeline, defines] = usePipelineOptions({
    mode,
    topology: 'triangle-list',
    side: 'both',
    alphaToCoverage,
    depthTest: false,
    depthWrite: false,
    blend,
  });

  return use(Virtual, {
    vertexCount,
    instanceCount,

    links,
    defines,
    shouldDispatch,

    renderer: 'solid',
    pipeline,
    mode,
  });
}, 'RawFullScreen');
