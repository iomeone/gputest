import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo } from '@use-gpu/live';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { getNativeColor } from '../../hooks/useNativeColor';
import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualUI from '@use-gpu/wgsl/render/vertex/virtual-ui.wgsl';
import instanceFragmentUI from '@use-gpu/wgsl/render/fragment/ui.wgsl';

export type UIRenderProps = VirtualDraw;

const LABEL = 'UIRender';

export const UIRender: LiveComponent<UIRenderProps> = (props: UIRenderProps) => {
  const {
    links: {
      getVertex,
      getFragment,
    },
    ...rest
  } = props;

  const renderContext = useRenderContext();
  const {colorInput, colorSpace} = renderContext;

  const {bindGroups: {view: {layout: globalLayout, key: pipelineKey}}} = usePassContext();

  const vertexShader = instanceDrawVirtualUI;
  const fragmentShader = instanceFragmentUI;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getFragment,
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
    renderContext,
    globalLayout,
    pipelineKey,
    label: getShaderLabel([getVertex, getFragment], LABEL),
  };

  return yeet(drawCall(call));
};
