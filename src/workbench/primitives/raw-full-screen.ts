import type { LiveComponent } from '../../live';
import type { DeepPartial, TextureSource, LambdaSource } from '../../core';
import type { ShaderModule } from '../../shader';

import { useDraw } from '../hooks/useDraw';

import { memo, useMemo } from '../../live';

import { usePickingShader } from './hooks/picking';

import { useShader } from '../hooks/useShader';
import { useInitialRender, useNoInitialRender } from '../hooks/useInitialDispatch';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getFullScreenVertex } from '../../wgsl/instance/vertex/full-screen-view.wgsl';
import { getTextureColor } from '../../wgsl/mask/textured.wgsl';

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
  const links = useMemo(() => ({getVertex, getFragment, getPicking}), [getVertex, getFragment, getPicking]);

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
