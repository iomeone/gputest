import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { getNativeColor } from '../../hooks/useNativeColor';
import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import renderVirtualShaded from '@use-gpu/wgsl/render/vertex/virtual-shaded.wgsl';
import {
  main as renderFragmentShaded,
  mainWithDepth as renderFragmentShadedDepth,
} from '@use-gpu/wgsl/render/fragment/shaded.wgsl';

import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';
import { getSSAOSurface } from '@use-gpu/wgsl/instance/surface/ssao-surface.wgsl';
import { sampleSSAO } from '@use-gpu/wgsl/use/ssao.wgsl';

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
  } = usePassContext();

  const vertexShader = renderVirtualShaded;
  const fragmentShader = defines?.HAS_DEPTH ? renderFragmentShadedDepth : renderFragmentShaded;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface: ssao ? bindBundle(getSSAOSurface, {getSurface, sampleSSAO}) : getSurface,
      getLight: getLight && bindBundle(getLight, {applyLights, applyEnvironment}),
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getSurface, getLight, applyLights, applyEnvironment, defines, colorInput, colorSpace]);

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
