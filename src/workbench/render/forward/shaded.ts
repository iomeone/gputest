import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualShaded from '../../../wgsl/render/vertex/virtual-shaded.wgsl';
import {
  main as instanceFragmentShaded,
  mainWithDepth as instanceFragmentShadedDepth,
} from '../../../wgsl/render/fragment/shaded.wgsl';

import { getScissorColor } from '../../../wgsl/mask/scissor.wgsl';

export type ShadedRenderProps = VirtualDraw;

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

  const {layout: globalLayout} = useViewContext();
  const {layout: passLayout} = usePassContext();

  const vertexShader = instanceDrawVirtualShaded;
  const fragmentShader = defines?.HAS_DEPTH ? instanceFragmentShadedDepth : instanceFragmentShaded;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface,
      getLight: getLight && bindBundle(getLight, {applyLights, applyEnvironment}),
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, links, undefined);
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
    passLayout,
  };

  return yeet(drawCall(call));
};
