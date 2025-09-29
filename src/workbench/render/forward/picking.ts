import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { memo, use, fragment, yeet, useContext, useNoContext, useMemo, useNoMemo, useOne, useNoOne } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';
import { bindBundle, bindingToModule } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';

import { usePassContext } from '../../providers/pass-provider';
import { useViewContext } from '../../providers/view-provider';

import instanceDrawVirtualPicking from '@use-gpu/wgsl/render/vertex/virtual-pick.wgsl';
import instanceFragmentPicking from '@use-gpu/wgsl/render/fragment/pick.wgsl';

export type PickingRenderProps = VirtualDraw;

const ID_BINDING = { name: 'getId', format: 'u32', value: 0, args: [] };

export const PickingRender: LiveComponent<PickingRenderProps> = (props: PickingRenderProps) => {
  let {
    links: {
      getVertex,
      getPicking,
    },
    ...rest
  } = props;

  const {buffers: {picking: [renderContext]}} = usePassContext();

  const {layout: globalLayout} = useViewContext();

  const vertexShader = instanceDrawVirtualPicking;
  const fragmentShader = instanceFragmentPicking;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getPicking,
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = fragmentShader;
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getPicking]);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    renderContext,
    globalLayout,
    mode: 'picking',
  };

  return yeet(drawCall(call));
};
