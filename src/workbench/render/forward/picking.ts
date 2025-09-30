import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { yeet, useMemo, useOne } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { drawCall } from '../../queue/draw-call';

import { usePassContext } from '../../providers/pass-provider';
import { useViewContext } from '../../providers/view-provider';

import instanceDrawVirtualPicking from '@use-gpu/wgsl/render/vertex/virtual-pick.wgsl';
import instanceFragmentPicking from '@use-gpu/wgsl/render/fragment/pick.wgsl';

export type PickingRenderProps = VirtualDraw;

export const PickingRender: LiveComponent<PickingRenderProps> = (props: PickingRenderProps) => {
  const {
    links: {
      getVertex,
      getPicking,
    },
    defines,
    pipeline: propPipeline,
    ...rest
  } = props;

  const {buffers: {picking: [renderContext]}} = usePassContext();

  const {layout: globalLayout} = useViewContext();

  const vertexShader = instanceDrawVirtualPicking;
  const fragmentShader = instanceFragmentPicking;

  const pipeline = useOne(() => patch(propPipeline, {
    multisample: { count: 1, alphaToCoverageEnabled: false },
  }), propPipeline);

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getVertex,
      getPicking,
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, {}, (getPicking as any).defines);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getPicking]);

  const defs = useOne(() => ({...defines, HAS_ALPHA_TO_COVERAGE: false}), defines);

  // Inline the render fiber
  const call = {
    ...rest,
    vertex: v,
    fragment: f,
    defines: defs,
    pipeline,
    renderContext,
    globalLayout,
    mode: 'picking',
  };

  return yeet(drawCall(call));
};
