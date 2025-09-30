import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { getNativeColor } from '../../hooks/useNativeColor';
import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import renderVirtualSolid from '../../../wgsl/render/vertex/virtual-solidwgsl';
import renderFragmentSolid from '../../../wgsl/render/fragment/solidwgsl';

import { getScissorColor } from '../../../wgsl/mask/scissorwgsl';

export type SolidRenderProps = VirtualDraw;

const LABEL = 'SolidRender';

export const SolidRender: LiveComponent<SolidRenderProps> = (props: SolidRenderProps) => {
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

  const {bindGroups: {color: {layout: globalLayout, key: pipelineKey}}} = usePassContext();

  const vertexShader = renderVirtualSolid;
  const fragmentShader = renderFragmentSolid;

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getFragment,
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, defines, colorInput, colorSpace]);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines,
    renderContext,
    globalLayout,
    pipelineKey,
    label: getShaderLabel([getVertex, getFragment], LABEL),
  };

  return yeet(drawCall(call));
};
