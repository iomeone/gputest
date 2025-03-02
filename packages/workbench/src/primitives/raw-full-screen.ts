import type { LiveComponent } from '@use-gpu/live';
import type { DeepPartial, TextureSource, LambdaSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useOne  } from '@use-gpu/live';
import { getBundleKey } from '@use-gpu/shader/wgsl';

import { useShader } from '../hooks/useShader';
import { usePickingShader } from '../providers/picking-provider';
import { useInitialRender, useNoInitialRender } from '../hooks/useInitialDispatch';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getFullScreenVertex } from '@use-gpu/wgsl/instance/vertex/full-screen.wgsl';
import { getTextureColor } from '@use-gpu/wgsl/mask/textured.wgsl';

export type RawFullScreenProps = {
  texture?: TextureSource | LambdaSource | ShaderModule,
  filter?: ShaderModule,

  initial?: boolean,
  version?: number,

  pipeline?: DeepPartial<GPURenderPipelineDescriptor>,
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'alphaToCoverage' | 'alphaToDiscard' | 'blend'>;

export const RawFullScreen: LiveComponent<RawFullScreenProps> = memo((props: RawFullScreenProps) => {
  const {
    mode = 'opaque',
    alphaToCoverage,
    alphaToDiscard,
    blend,
    id = 0,

    initial = false,
    version = 0,
  } = props;

  const vertexCount = 3;
  const instanceCount = 1;

  const t = useNativeColorTexture(props.texture, props.filter);

  const getVertex = getFullScreenVertex;
  const getPicking = usePickingShader({id});
  const getFragment = useShader(getTextureColor, [t]);
  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const shouldDispatch = initial ? useInitialRender([version]) : (useNoInitialRender(), undefined);

  const [pipeline, defines] = usePipelineOptions({
    mode,
    topology: 'triangle-list',
    side: 'both',
    alphaToCoverage,
    alphaToDiscard,
    depthTest: false,
    depthWrite: false,
    blend,
  });

  return useDraw({
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
