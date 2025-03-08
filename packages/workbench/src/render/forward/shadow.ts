import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { usePassContext } from '../../providers/pass-provider';

import {
  main as renderVirtualDepth,
  mainWithDepth as renderVirtualDepthDepth,
} from '@use-gpu/wgsl/render/vertex/virtual-depth.wgsl';
import renderFragmentDepth from '@use-gpu/wgsl/render/fragment/depth.wgsl';
import renderFragmentDepthDepth from '@use-gpu/wgsl/render/fragment/depth-frag.wgsl';

import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';

export type ShadowRenderProps = VirtualDraw;

const LABEL = 'ShadowRender';

export const ShadowRender: LiveComponent<ShadowRenderProps> = (props: ShadowRenderProps) => {
  const {
    links: {
      getVertex,
      getFragment,
      getDepth,
    },
    defines,
    pipeline: propPipeline,
    ...rest
  } = props;

  const {
    buffers: {shadow: [renderContext]},
    bindGroups: {view: {layout: globalLayout, key: pipelineKey}},
  } = usePassContext();

  const vertexShader = defines?.HAS_DEPTH ? renderVirtualDepthDepth : renderVirtualDepth;
  const fragmentShader = defines?.HAS_DEPTH ? renderFragmentDepthDepth : renderFragmentDepth;

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
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, getDepth, defines]);

  const defs = useOne(() => ({...defines, HAS_ALPHA_TO_COVERAGE: true}), defines);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines: defs,
    pipeline,
    renderContext,
    globalLayout,
    pipelineKey,
    mode: 'shadow',
    label: getShaderLabel([getVertex, getFragment, getDepth], LABEL),
  };

  return yeet(drawCall(call));
};
