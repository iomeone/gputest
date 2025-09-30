import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '../../../live';
import { patch, $delete } from '../../../state';
import { bindBundle } from '../../../shader/wgsl';

import { drawCall } from '../../queue/draw-call';

import { usePassContext } from '../../providers/pass-provider';

import renderVirtualNormal from '../../../wgsl/render/vertex/virtual-normal.wgsl';
import {
  main as renderFragmentNormal,
  mainWithDepth as renderFragmentNormalDepth,
} from '../../../wgsl/render/fragment/normal.wgsl';

import { getScissorColor } from '../../../wgsl/mask/scissor.wgsl';

export type NormalRenderProps = VirtualDraw;

export const NormalRender: LiveComponent<NormalRenderProps> = (props: NormalRenderProps) => {
  const {
    links: {
      getVertex,
      getSurface,
      getFacet,
    },
    defines,
    pipeline: propPipeline,
    ...rest
  } = props;

  const {
    buffers: {normal: [renderContext]},
    bindGroups: {view: {layout: globalLayout, key: pipelineKey}},
  } = usePassContext();

  const vertexShader = renderVirtualNormal;
  const fragmentShader = defines?.HAS_DEPTH ? renderFragmentNormalDepth : renderFragmentNormal;
  const hasScissor = defines?.HAS_SCISSOR;

  const pipeline = useOne(() => patch(propPipeline, {
    multisample: { alphaToCoverageEnabled: false },
    fragment: {targets: {0: {blend: $delete()}} as any},
  }), propPipeline);

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface,
      getFacet,
      getScissor: hasScissor ? getScissorColor : null,
    };
    const d = { HAS_FACET: !!getFacet };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links, d);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getSurface, getFacet, hasScissor]);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines,
    pipeline,
    renderContext,
    globalLayout,
    pipelineKey,
    mode: 'normal',
  };

  return yeet(drawCall(call));
};
