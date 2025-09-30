import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualShaded from '@use-gpu/wgsl/render/vertex/virtual-shaded.wgsl';
import {
  main as instanceFragmentShaded,
  mainWithDepth as instanceFragmentShadedDepth,
} from '@use-gpu/wgsl/render/fragment/deferred-shaded.wgsl';

import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';

export type DeferredShadedRenderProps = VirtualDraw;

export const DeferredShadedRender: LiveComponent<DeferredShadedRenderProps> = (props: DeferredShadedRenderProps) => {
  const {
    links: {
      getVertex,
      getSurface,
    },
    defines,
    ...rest
  } = props;

  const renderContext = useRenderContext();
  const {colorInput, colorSpace} = renderContext;

  const {layout: globalLayout} = useViewContext();
  const {buffers: {gbuffer: [gbuffer]}} = usePassContext();

  const vertexShader = instanceDrawVirtualShaded;
  const fragmentShader = defines?.HAS_DEPTH ? instanceFragmentShadedDepth : instanceFragmentShaded;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface,
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, links, undefined);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getSurface, defines, colorInput, colorSpace]);

  const defs = useOne(() => ({...defines, HAS_ALPHA_TO_COVERAGE: true}), defines);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines: defs,
    renderContext: gbuffer,
    globalLayout,
  };

  return yeet(drawCall(call));
};
