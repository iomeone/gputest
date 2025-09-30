import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '../../../live';
import { patch } from '../../../state';
import { bindBundle } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';
import { getShaderLabel } from '../../pass/util';

import { usePassContext } from '../../providers/pass-provider';

import {
  main as renderVirtualDepth,
  mainWithDepth as renderVirtualDepthDepth,
} from '../../../wgsl/render/vertex/virtual-depth.wgsl';
import {
  main as renderVirtualShaded,
} from '../../../wgsl/render/vertex/virtual-shaded.wgsl';
import renderFragmentDepth from '../../../wgsl/render/fragment/depth.wgsl';
import renderFragmentDepthOnly from '../../../wgsl/render/fragment/depth-only.wgsl';
import renderFragmentDepthShaded from '../../../wgsl/render/fragment/depth-shaded.wgsl';

import { getScissorColor } from '../../../wgsl/mask/scissor.wgsl';

export type ShadowRenderProps = VirtualDraw;

const LABEL = 'ShadowRender';

export const ShadowRender: LiveComponent<ShadowRenderProps> = (props: ShadowRenderProps) => {
  const {
    links: {
      getVertex,
      getFragment,
      getDepth,
      getSurface,
    },
    defines,
    pipeline: propPipeline,
    ...rest
  } = props;

  const {
    buffers: {shadow: [renderContext]},
    bindGroups: {view: {layout: globalLayout, key: pipelineKey}},
  } = usePassContext();

  const vertexShader = defines?.HAS_DEPTH ?
    (
      getDepth ? renderVirtualDepthDepth :
      !getFragment && getSurface ? renderVirtualShaded :
      renderVirtualDepth
    ) : renderVirtualDepth;

  const fragmentShader = defines?.HAS_DEPTH ?
    (
      getDepth ? renderFragmentDepthOnly :
      !getFragment && getSurface ? renderFragmentDepthShaded :
      renderFragmentDepth
    ) : renderFragmentDepth;

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
      getSurface,
      getScissor: defines?.HAS_SCISSOR ? getScissorColor : null,
    };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, getDepth, getSurface, defines]);

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
