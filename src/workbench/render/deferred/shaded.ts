import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { memo, use, fragment, yeet, useContext, useNoContext, useMemo, useNoMemo, useOne, useNoOne } from '../../../live';
import { resolve } from '../../../core';
import { bindBundle, bindingToModule } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualShaded from '../../../wgsl/render/vertex/virtual-shaded.wgsl';
import {
  main as instanceFragmentShaded,
  mainWithDepth as instanceFragmentShadedDepth,
} from '../../../wgsl/render/fragment/deferred-shaded.wgsl';

import { getScissorColor } from '../../../wgsl/mask/scissor.wgsl';

export type DeferredShadedRenderProps = VirtualDraw;

export const DeferredShadedRender: LiveComponent<DeferredShadedRenderProps> = (props: DeferredShadedRenderProps) => {
  let {
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
  }, [vertexShader, fragmentShader, getVertex, getSurface, colorInput, colorSpace]);

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
