import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { getNativeColor } from '../../hooks/useNativeColor';
import { getShader } from '../../hooks/useShader';
import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import renderVirtualShaded from '../../../wgsl/render/vertex/virtual-shadedwgsl';
import {
  main as renderFragmentShaded,
  mainWithDepth as renderFragmentShadedDepth,
} from '../../../wgsl/render/fragment/shadedwgsl';

import { getScissorColor } from '../../../wgsl/mask/scissorwgsl';
import { getSSAOSurface } from '../../../wgsl/instance/surface/ssao-surfacewgsl';
import { sampleSSAO } from '../../../wgsl/use/ssaowgsl';

export type ShadedRenderProps = VirtualDraw;

const LABEL = 'ShadedRender';

export const ShadedRender: LiveComponent<ShadedRenderProps> = (props: ShadedRenderProps) => {
  const {
    links: {
      getVertex,
      getSurface,
      getLight,
      applyLights,
      applyEnvironment,
    },
    defines,
    ...rest
  } = props;

  const renderContext = useRenderContext();
  const {colorInput, colorSpace} = renderContext;

  const {
    buffers: {ssao},
    bindGroups: {color: {layout: globalLayout, key: pipelineKey}},
    options: {ssao: ssaoOptions},
  } = usePassContext();

  const vertexShader = renderVirtualShaded;
  const fragmentShader = defines?.HAS_DEPTH ? renderFragmentShadedDepth : renderFragmentShaded;
  const hasScissor = defines?.HAS_SCISSOR;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface: ssao && ssaoOptions ? getShader(getSSAOSurface, [getSurface, sampleSSAO, ssaoOptions.opacity, ssaoOptions.indirect]) : getSurface,
      getLight: getLight && bindBundle(getLight, {applyLights, applyEnvironment}),
      getScissor: hasScissor ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getSurface, getLight, applyLights, applyEnvironment, colorInput, colorSpace, hasScissor, ssao, ssaoOptions]);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines,
    renderContext,
    globalLayout,
    pipelineKey,
    label: getShaderLabel([getVertex, getSurface, getLight], LABEL),
  };

  return yeet(drawCall(call));
};
