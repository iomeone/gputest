import { LiveComponent } from '../../live/types';
import { RenderPassMode, DeepPartial } from '../../core/types';
import { ShaderModule, ParsedBundle, ParsedModule } from '../../shader/types';
import { memo, use, useContext, useNoContext, useFiber, useMemo, useOne, useState, useResource, useConsoleLog } from '../../live';

import { bindBundle, bindingsToLinks } from '../../shader/glsl';
import { useRenderPipeline } from '../hooks/useRenderPipeline';

import instanceDrawVirtual from '../../gen-glsl/instance/draw/virtual';
import instanceDrawWireframeStrip from '../../gen-glsl/instance/draw/wireframe-strip';
import instanceFragmentSolid from '../../gen-glsl/instance/fragment/solid';

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
  deps: any[],
};

const getDebugShader = (topology: GPUPrimitiveTopology) => {
  if (topology === 'triangle-strip') return instanceDrawWireframeStrip;
  // TODO
  if (topology === 'triangle-list') return instanceDrawWireframeStrip;
  return instanceDrawWireframeStrip;
}

export const Virtual: LiveComponent<VirtualProps> = memo((props) => {
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

  // TODO: non-strip topology
  const topology = pipeline.primitive?.topology ?? 'triangle-list';
  const vertexShader = !isDebug ? instanceDrawVirtual : getDebugShader(topology);
  const fragmentShader = instanceFragmentSolid;

  // Binds links into shader
  const key = useFiber().id;
  const [v, f] = useMemo(() => {
    const links = { getVertex, getFragment };
    const v = bindBundle(vertexShader, links, defines, key);
    const f = bindBundle(fragmentShader, links, defines, key);
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
