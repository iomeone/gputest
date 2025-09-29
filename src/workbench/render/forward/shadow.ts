import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { memo, use, fragment, yeet, useContext, useNoContext, useMemo, useNoMemo, useOne, useNoOne } from '../../../live';
import { resolve } from '../../../core';
import { patch, $apply } from '../../../state';
import { bindBundle, bindingToModule } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';

import { usePassContext } from '../../providers/pass-provider';
import { useViewContext } from '../../providers/view-provider';

import {
  main as instanceDrawVirtualDepth,
  mainWithDepth as instanceDrawVirtualDepthDepth,
} from '../../../wgsl/render/vertex/virtual-depthwgsl';
import instanceFragmentDepth from '../../../wgsl/render/fragment/depthwgsl';
import instanceFragmentDepthDepth from '../../../wgsl/render/fragment/depth-fragwgsl';

import { getScissorColor } from '../../../wgsl/mask/scissorwgsl';

export type ShadowRenderProps = VirtualDraw;

export const ShadowRender: LiveComponent<ShadowRenderProps> = (props: ShadowRenderProps) => {
  let {
    links: {
      getVertex,
      getFragment,
      getDepth,
    },
    defines,
    pipeline: propPipeline,
    ...rest
  } = props;

  const {buffers: {shadow: [renderContext]}} = usePassContext();

  const {layout: globalLayout} = useViewContext();

  const vertexShader = defines?.HAS_DEPTH ? instanceDrawVirtualDepthDepth : instanceDrawVirtualDepth;
  const fragmentShader = defines?.HAS_DEPTH ? instanceFragmentDepthDepth : instanceFragmentDepth;

  const pipeline = useOne(() => patch(propPipeline, {
    multisample: { count: 1, alphaToCoverageEnabled: false },
    fragment: { targets: [] },
  }), propPipeline);

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getFragment,
      getDepth,
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, links, undefined);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, getDepth]);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines,
    pipeline,
    renderContext,
    globalLayout,
    mode: 'shadow',
  };

  return yeet(drawCall(call));
};
