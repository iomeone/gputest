import type { LiveComponent } from '../../../live';
import type { VirtualDraw } from '../../pass/types';

import { memo, use, fragment, yeet, useContext, useNoContext, useMemo, useNoMemo, useOne, useNoOne } from '../../../live';
import { resolve } from '../../../core';
import { bindBundle, bindingToModule } from '../../../shader/wgsl';

import { DrawCall, drawCall } from '../../queue/draw-call';
import { Dispatch } from '../../queue/dispatch';
import { getWireframe, getWireframeIndirect } from '../wireframe';

import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import instanceDrawVirtualSolid from '../../../wgsl/render/vertex/virtual-solidwgsl';
import instanceFragmentSolid from '../../../wgsl/render/fragment/solidwgsl';

export type DebugRenderProps = VirtualDraw;

export const DebugRender: LiveComponent<DebugRenderProps> = (props: DebugRenderProps) => {
  let {
    vertexCount: vC = 0,
    instanceCount: iC = 0,
    indirect,

    links: {
      getVertex: gV,
    },

    pipeline,
    defines,
    ...rest
  } = props;

  const topology = (pipeline as any)?.primitive?.topology ?? 'triangle-list';

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const {layout: globalLayout} = useViewContext();
  const {layout: passLayout} = usePassContext();

  const vertexShader = instanceDrawVirtualSolid;
  const fragmentShader = instanceFragmentSolid;

  // Binds links into shader
  const [v, f, vertexCount, instanceCount, wireframeCommand, wireframeIndirect] = useMemo(() => {
    let getVertex = gV;
    let vertexCount = vC;
    let instanceCount = iC;
    let wireframeCommand = null;
    let wireframeIndirect = null;

    // Decorate vertex shader with wireframe operator
    if (indirect) {
      ({getVertex, wireframeCommand, wireframeIndirect} = getWireframeIndirect(device, gV, indirect, topology));
    } else  {
      ({getVertex, vertexCount, instanceCount} = getWireframe(gV, vC, iC, topology));
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
