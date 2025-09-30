import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { use, yeet, useMemo, useOne } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { DrawCall, drawCall } from '../../queue/draw-call';
import { Dispatch } from '../../queue/dispatch';
import { getWireframe, getWireframeIndirect } from '../wireframe';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualSolid from '@use-gpu/wgsl/render/vertex/virtual-solid.wgsl';
import instanceFragmentSolid from '@use-gpu/wgsl/render/fragment/solid.wgsl';

export type DebugRenderProps = VirtualDraw;

export const DebugRender: LiveComponent<DebugRenderProps> = (props: DebugRenderProps) => {
  const {
    vertexCount: vC = 0,
    instanceCount: iC = 0,
    indirect,

    links: {
      getVertex: gV,
    },

    pipeline: propPipeline,
    defines,
    ...rest
  } = props;

  if (gV == null) throw new Error("No vertex shader provided");

  const topology = (propPipeline as any)?.primitive?.topology ?? 'triangle-list';

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const {layout: globalLayout} = useViewContext();
  const {layout: passLayout} = usePassContext();

  const vertexShader = instanceDrawVirtualSolid;
  const fragmentShader = instanceFragmentSolid;

  const pipeline = useOne(() => patch(propPipeline, {primitive: {topology: 'triangle-strip'}}), propPipeline);

  // Binds links into shader
  const [v, f, vertexCount, instanceCount, wireframeCommand, wireframeIndirect] = useMemo(() => {
    let getVertex = gV;
    let vertexCount = vC;
    let instanceCount = iC;
    let wireframeCommand = null;
    let wireframeIndirect = null;

    // Decorate vertex shader with wireframe operator
    if (indirect) {
      ({
        getVertex,
        wireframeCommand,
        wireframeIndirect,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      } = getWireframeIndirect(device, gV!, indirect, topology));
    } else  {
      ({
        getVertex,
        vertexCount,
        instanceCount,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      } = getWireframe(gV!, vC, iC, topology));
    }

    const links = {getVertex};
    const v = bindBundle(vertexShader, links, undefined);
    const f = fragmentShader;
    return [v, f, vertexCount, instanceCount, wireframeCommand, wireframeIndirect];
  }, [device, vertexShader, fragmentShader, gV]);

  const defs = useOne(() => ({...defines, HAS_SCISSOR: !!defines.HAS_SCISSOR}), defines);

  // Inline the render fiber
  const call = {
    ...rest,
    vertexCount,
    instanceCount,
    indirect: wireframeIndirect,
    vertex: v,
    fragment: f,
    defines: defs,
    pipeline,
    renderContext,
    globalLayout,
    passLayout,
    mode: 'debug',
  };

  // Count indirect vertices/instances for wireframe
  if (wireframeCommand) {
    return [use(Dispatch, {shader: wireframeCommand}), use(DrawCall, call)];
  }

  return yeet(drawCall(call));
};
