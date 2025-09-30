import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '../../../live';
import { bindBundle } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getNativeColor } from '../../hooks/useNativeColor';

import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import renderVirtualSolid from '../../../wgsl/render/vertex/virtual-solid.wgsl';
import renderFragmentSolid from '../../../wgsl/render/fragment/deferred-solid.wgsl';

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

  const {
    buffers: {gBuffer: [gBuffer]},
    bindGroups: {view: {layout: globalLayout, key: pipelineKey}},
  } = usePassContext();

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

  const defs = useOne(() => ({...defines, HAS_ALPHA_TO_COVERAGE: true}), defines);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines: defs,
    renderContext: gBuffer,
    globalLayout,
    pipelineKey,
  };

  return yeet(drawCall(call));
};
