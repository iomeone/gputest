import { LiveComponent } from '../../live/types';
import { RenderPassMode, DeepPartial } from '../../core/types';
import { ShaderModule, ParsedBundle, ParsedModule } from '../../shader/types';
import { memo, use, useContext, useNoContext, useFiber, useMemo, useOne, useState, useResource, useConsoleLog } from '../../live';

import { bindBundle, bindingsToLinks } from '../../shader/wgsl';
import { useRenderPipeline } from '../hooks/useRenderPipeline';

import instanceDrawVirtual from '../../gen-wgsl/instance/draw/virtual';
import instanceDrawVirtualPick from '../../gen-wgsl/instance/draw/virtual-pick';

import instanceFragmentSolid from '../../gen-wgsl/instance/fragment/solid';
import instanceFragmentSolidPick from '../../gen-wgsl/instance/fragment/solid-pick';

import instanceDrawWireframeStrip from '../../gen-wgsl/instance/draw/wireframe-strip';

import { render } from './render';

export type VirtualProps = {
  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,

  vertexCount: number,
  instanceCount: number,

  getVertex: ShaderModule,
  getFragment: ShaderModule,

  defines: Record<string, any>,
  deps: any[] | null,
};

export const Virtual: LiveComponent<VirtualProps> = memo((props: VirtualProps) => {
  const {
    getVertex,
    getFragment,

    pipeline,
    defines,
    deps = null,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  const isDebug = mode === RenderPassMode.Debug;
  const isPicking = mode === RenderPassMode.Picking;

  const topology = pipeline.primitive?.topology ?? 'triangle-list';

  let vertexShader: ParsedBundle;
  let fragmentShader: ParsedBundle;
  if (isDebug) {
    // TODO: non-strip topology
    // if (topology === 'triangle-strip')
    // if (topology === 'triangle-list')
    vertexShader   = instanceDrawWireframeStrip;
    fragmentShader = instanceFragmentSolid;
  }
  else {
    vertexShader   = isPicking ? instanceDrawVirtualPick : instanceDrawVirtual;
    fragmentShader = isPicking ? instanceFragmentSolidPick : instanceFragmentSolid;
  }

  // Binds links into shader
  const key = useFiber().id;
  const [v, f] = useMemo(() => {
    const links = { getVertex, getFragment };
    const v = bindBundle(vertexShader, links, {}, key);
    const f = bindBundle(fragmentShader, links, {}, key);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment]);

  // Debug wireframe
  let {
    vertexCount,
    instanceCount,
  } = props;
  if (isDebug) {
    if (topology === 'triangle-strip') {
      const tris = vertexCount - 2;
      const edges = tris * 2 + 1;
      
      vertexCount = 4;
      instanceCount = edges * instanceCount;
    }
    if (topology === 'triangle-list') {
      vertexCount = 4;
      instanceCount = vertexCount * instanceCount;
    }
  }

  // Inline the render fiber to avoid another memo()
  return render({
    vertexCount,
    instanceCount,
    vertex: v,
    fragment: f,
    defines,
    deps,

    pipeline,
    mode,
    id,
  });
}, "Virtual");
