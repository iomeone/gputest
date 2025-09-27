import type { LiveComponent } from '@use-gpu/live';
import type { RenderPassMode, DeepPartial, Lazy } from '@use-gpu/core';
import type { ShaderModule, ParsedBundle, ParsedModule } from '@use-gpu/shader';
import { memo, use, fragment, useContext, useNoContext, useMemo, useNoMemo, useOne, useState, useResource } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';

import { bindBundle, bindingToModule } from '@use-gpu/shader/wgsl';
import { getWireframe } from '../render/wireframe';
import { useInspectHoverable } from '../hooks/useInspectable';

import { DeviceContext } from '../providers/device-provider';
import { ViewContext } from '../providers/view-provider';
import { RenderContext } from '../providers/render-provider';
import { PickingContext } from '../render/picking';
import { getNativeColor } from '../hooks/useNativeColor';

import instanceDrawVirtualShaded from '@use-gpu/wgsl/render/vertex/virtual-shaded.wgsl';
import instanceDrawVirtualSolid from '@use-gpu/wgsl/render/vertex/virtual-solid.wgsl';
import instanceDrawVirtualPick from '@use-gpu/wgsl/render/vertex/virtual-pick.wgsl';
import instanceDrawVirtualUI from '@use-gpu/wgsl/render/vertex/virtual-ui.wgsl';

import instanceFragmentShaded from '@use-gpu/wgsl/render/fragment/shaded.wgsl';
import instanceFragmentSolid from '@use-gpu/wgsl/render/fragment/solid.wgsl';
import instanceFragmentPick from '@use-gpu/wgsl/render/fragment/pick.wgsl';
import instanceFragmentUI from '@use-gpu/wgsl/render/fragment/ui.wgsl';

import { drawCall } from './draw-call';

const PICK_RENDERER = [
  instanceDrawVirtualPick,
  instanceFragmentPick,
] as VirtualRenderer;

const SOLID_RENDERER = [
  instanceDrawVirtualSolid,
  instanceFragmentSolid,
] as VirtualRenderer;

const SHADED_RENDERER = [
  instanceDrawVirtualShaded,
  instanceFragmentShaded,
] as VirtualRenderer;

const UI_RENDERER = [
  instanceDrawVirtualUI,
  instanceFragmentUI,
] as VirtualRenderer;

const BUILTIN = {
  solid: SOLID_RENDERER,
  shaded: SHADED_RENDERER,
  ui: UI_RENDERER,
} as Record<string, VirtualRenderer>;

type VirtualRenderer = [ParsedBundle, ParsedBundle];

export type VirtualProps = {
  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,

  vertexCount: Lazy<number>,
  instanceCount: Lazy<number>,

  getVertex: ShaderModule,
  getFragment: ShaderModule,

  renderer?: VirtualRenderer | string,
  defines: Record<string, any>,
};

const DEBUG_BINDING = { name: 'getInstanceSize', format: 'u32', value: 0, args: [] };
const ID_BINDING = { name: 'getId', format: 'u32', value: 0, args: [] };

export const Virtual: LiveComponent<VirtualProps> = memo((props: VirtualProps) => {
  const {
    mode = 'opaque',
    id = 0,
  } = props;

  if (id && mode !== 'picking') {
    return fragment([
      use(Variant, {...props, id: 0}),
      use(Variant, {...props, mode: 'picking'}),
    ]);
  }
  
  return Variant(props);
}, 'Virtual'); 

export const Variant: LiveComponent<VirtualProps> = (props: VirtualProps) => {
  let {
    getVertex: gV,
    vertexCount: vC,
    instanceCount: iC,

    getFragment,

    pipeline,
    defines,

    renderer = SOLID_RENDERER,
    mode = 'opaque',
    id = 0,
  } = props;

  let m = mode;
  const hovered = useInspectHoverable();
  if (hovered) m = 'debug';

  const isDebug = m === 'debug';
  const isPicking = m === 'picking';
  const topology = pipeline.primitive?.topology ?? 'triangle-list';

  const renderContext = useContext(RenderContext);
  const pickingContext = useContext(PickingContext);
  const resolvedContext = isPicking ? pickingContext?.renderContext : renderContext;
  if (!resolvedContext) throw new Error("GPU picking is not available");

  const {colorInput, colorSpace} = resolvedContext;

  const [
    vertexShader,
    fragmentShader,
    getVertex,
    vertexCount,
    instanceCount
  ] = useMemo(() => {
    let vertexShader: ShaderModule;
    let fragmentShader: ShaderModule;

    let getVertex: ShaderModule = gV;
    let vertexCount: Lazy<number> = vC;
    let instanceCount: Lazy<number> = iC;

    if (isDebug) {
      [vertexShader, fragmentShader] = SOLID_RENDERER;
      ({getVertex, vertexCount, instanceCount} = getWireframe(gV, vC, iC, topology));
    }
    else if (isPicking) {
      [vertexShader, fragmentShader] = PICK_RENDERER;
    }
    else {
      let r: VirtualRenderer | undefined;
      r = (typeof renderer == 'string') ? BUILTIN[renderer] : renderer;
      if (!r) throw new Error(`Unknown renderer '${renderer}'`);
      [vertexShader, fragmentShader] = r;
    }

    return [vertexShader, fragmentShader, getVertex, vertexCount, instanceCount];
  }, [gV, vC, iC, m, topology]);

  const getId = useOne(() => isPicking ? bindingToModule({uniform: ID_BINDING, constant: id}) : null, id);

  // Binds links into shader
  const [v, f] = useMemo(() => {
    const links = {
      getId,
      getVertex,
      getFragment: isDebug ? null : getFragment,
      toColorSpace: getNativeColor(colorInput, colorSpace),
    };
    const v = bindBundle(vertexShader, links, undefined);
    const f = bindBundle(fragmentShader, links, undefined);
    return [v, f];
  }, [vertexShader, fragmentShader, getVertex, getFragment, getId, isDebug, colorInput, colorSpace]);
  
  // Inline the render fiber to avoid another memo()
  return drawCall({
    vertexCount,
    instanceCount,
    vertex: v,
    fragment: f,
    defines,
    pipeline,
    renderContext: resolvedContext,
    mode: m,
    id,
  });
};
