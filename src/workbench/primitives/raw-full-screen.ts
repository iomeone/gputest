import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, LambdaSource, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { ViewContext } from '../providers/view-provider';
import { Virtual } from './virtual';

import { patch } from '@use-gpu/state';
import { use, yeet, memo, useOne } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, bundleToAttributes } from '@use-gpu/shader/wgsl';
import { makeShaderBindings } from '@use-gpu/core';

import { useBoundShader } from '../hooks/useBoundShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';
import { getTextureFragment } from '@use-gpu/wgsl/mask/textured.wgsl';

export type RawFullScreenProps = {
  texture?: TextureSource | LambdaSource | ShaderModule,

  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode,
  id?: number,
};

const ZERO = [0, 0, 0, 1];

const FRAGMENT_BINDINGS = bundleToAttributes(getTextureFragment);

const PIPELINE = {
  primitive: {
    topology: 'triangle-list',
  },
  depthStencil: {
    depthWriteEnabled: false,
  },
} as DeepPartial<GPURenderPipelineDescriptor>;

export const RawFullScreen: LiveComponent<RawFullScreenProps> = memo((props: RawFullScreenProps) => {
  const {
    pipeline: propPipeline,
    mode = 'opaque',
    id = 0,
  } = props;

  const vertexCount = 3;
  const instanceCount = 1;

  const pipeline = useOne(() => patch(PIPELINE, propPipeline), propPipeline);

  const t = useNativeColorTexture(props.texture);

  const getVertex = getFullScreenVertex;
  const getFragment = useBoundShader(getTextureFragment, FRAGMENT_BINDINGS, [t]);

  return use(Virtual, {
    vertexCount,
    instanceCount,

    getVertex,
    getFragment,

    pipeline,
    mode,
    id,
  });
}, 'RawFullScreen');
