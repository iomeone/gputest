import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';

import { usePassContext } from '../../providers/pass-provider';

import renderVirtualNormal from '@use-gpu/wgsl/render/vertex/virtual-normal.wgsl';
import {
  main as renderFragmentNormal,
  mainWithDepth as renderFragmentNormalDepth,
} from '@use-gpu/wgsl/render/fragment/normal.wgsl';

import { getScissorColor } from '@use-gpu/wgsl/mask/scissor.wgsl';

export type NormalRenderProps = VirtualDraw;

export const NormalRender: LiveComponent<NormalRenderProps> = (props: NormalRenderProps) => {
  const {
    links: {
      getVertex,
      getSurface,
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
    multisample: { count: 1, alphaToCoverageEnabled: false },
  }), propPipeline);

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getSurface,
      getScissor: hasScissor ? getScissorColor : null,
    };
    const v = bindBundle(vertexShader, links);
    const f = bindBundle(fragmentShader, links);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getSurface, hasScissor]);

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
