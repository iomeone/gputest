import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { memo, use, fragment, yeet, useContext, useNoContext, useMemo, useNoMemo, useOne, useNoOne } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';
import { bindBundle, bindingToModule } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualSolid from '@use-gpu/wgsl/render/vertex/virtual-solid.wgsl';
import instanceFragmentSolid from '@use-gpu/wgsl/render/fragment/solid.wgsl';

import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';

export type SolidRenderProps = VirtualDraw;

export const SolidRender: LiveComponent<SolidRenderProps> = (props: SolidRenderProps) => {
  let {
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
  const {layout: passLayout} = usePassContext();
  
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
  }, [vertexShader, fragmentShader, getVertex, getFragment, colorInput, colorSpace]);

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
