import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualSolid from '../../../wgsl/render/vertex/virtual-solid.wgsl';
import instanceFragmentSolid from '../../../wgsl/render/fragment/deferred-solid.wgsl';

import { getScissorColor } from '../../../wgsl/mask/scissor.wgsl';

export type DeferredSolidRenderProps = VirtualDraw;

export const DeferredSolidRender: LiveComponent<DeferredSolidRenderProps> = (props: DeferredSolidRenderProps) => {
  const {
    links: {
      getVertex,
      getFragment,
    },
    defines,
    ...rest
  } = props;

  const renderContext = useRenderContext();
  const {colorInput, colorSpace} = renderContext;

  const {layout: globalLayout} = useViewContext();
  const {buffers: {gbuffer: [gbuffer]}} = usePassContext();

  const vertexShader = instanceDrawVirtualSolid;
  const fragmentShader = instanceFragmentSolid;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getFragment,
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, links, undefined);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, defines, colorInput, colorSpace]);

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
