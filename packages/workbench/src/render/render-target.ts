import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Blending, OffscreenRenderContext, ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { provide, fence, yeet, useContext, useMemo, useOne } from '@use-gpu/live';
import { getTextureSampleType } from '@use-gpu/core';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';

import { useInspectable } from '../hooks/useInspectable';
import { getRenderFunc } from '../hooks/useRenderProp';

import {
  makeBlendState,
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  getDefaultBlendMode,
  seq,
} from '@use-gpu/core';

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderTargetProps = {
  width?: number,
  height?: number,
  samples?: number,
  resolution?: number,
  overscan?: number,
  history?: number,

  format?: GPUTextureFormat | null,
  depthStencil?: GPUTextureFormat | null,
  depthHistory?: boolean,
  sampler?: Partial<GPUSamplerDescriptor>,
  variant?: string,
  absolute?: boolean,

  backgroundColor?: GPUColor,
  blend?: Blending | GPUBlendState | null,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,

  label?: string,
  hint?: string,

  render?: (rttContext: OffscreenRenderContext) => LiveElement,
  children?: LiveElement | ((rttContext: OffscreenRenderContext) => LiveElement),
  then?: (target: TextureTarget) => LiveElement,
};

/** Off-screen render target.

Place `@{<Pass>}` directly inside, or leave empty to use yielded target with `@{<RenderToTexture>}`.
*/
export const RenderTarget: LiveComponent<RenderTargetProps> = (props: RenderTargetProps) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const inspect = useInspectable();

  const {
    resolution = 1,
    overscan = 0,
    width = Math.ceil((renderContext.width + overscan * 2) * resolution),
    height = Math.ceil((renderContext.height + overscan * 2) * resolution),
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    history = 0,
    sampler = NO_SAMPLER,
    depthStencil = DEPTH_STENCIL_FORMAT,
    depthHistory = false,
    backgroundColor = EMPTY_COLOR,
    blend,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    variant = 'textureSample',
    absolute = false,
    label,
    hint,
    children,
    then,
  } = props;

  // Color target + history
  const [renderTexture, resolveTexture, bufferTextures, bufferViews, counter] = useMemo(
    () => {
      const counter = { current: 0 };
      if (!format) return [null, null, null, null, counter];

      const render =
        makeTargetTexture(
          device,
          width,
          height,
          1,
          format,
          samples,
        );

      const resolve = samples > 1 ?
        makeTargetTexture(
          device,
          width,
          height,
          1,
          format,
        ) : null;

      const buffers = history > 0 ? seq(history).map(() =>
        makeTargetTexture(
          device,
          width,
          height,
          1,
          format,
        )
      ) : null;
      if (buffers) buffers.push(resolve ?? render);

      const views = buffers ? buffers.map(b => b.createView()) : undefined;

      if (label != null) {
        render.label = label;
        if (resolve) resolve.label = label;
        if (buffers) for (const b of buffers) b.label = label;
        if (views) for (const v of views) v.label = label;
      }

      return [render, resolve, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );

  const targetTexture = resolveTexture ?? renderTexture;

  // Depth texture + history
  const [
    depthTexture,
    depthTextures,
    depthViews,
    depthStencilAttachment,
  ] = useMemo(() => {
      if (!depthStencil) return [];

      const texture = makeTargetTexture(
        device,
        width,
        height,
        1,
        depthStencil,
        samples,
      );

      const buffers = depthHistory && (history > 0) ? seq(history).map(() =>
        makeTargetTexture(
          device,
          width,
          height,
          1,
          depthStencil,
          samples,
        )
      ) : null;
      if (buffers) buffers.push(texture);

      const views = buffers ? buffers.map(b => b.createView({ aspect: 'depth-only' })) : undefined;

      if (label != null) {
        const l = `${label} Depth`;
        texture.label = l;
        if (buffers) for (const b of buffers) b.label = l;
        if (views) for (const v of views) v.label = l;
      }

      const attachment = makeDepthStencilAttachment(texture, depthStencil);

      return [texture, buffers, views, attachment];
    },
    [device, width, height, depthStencil, depthHistory, history, samples, label]
  );

  // Color/depth state and attachments
  const colorStates = useOne(() => (
    format ? [makeColorState(format, makeBlendState(blend ?? getDefaultBlendMode(format)))] : []
  ), format);

  const colorAttachments = useMemo(() =>
    renderTexture || resolveTexture
      ? [makeColorAttachment(renderTexture, resolveTexture, backgroundColor)]
      : [],
    [renderTexture, resolveTexture, backgroundColor]
  );
  const depthStencilState = useOne(() => depthStencil
    ? makeDepthStencilState(depthStencil)
    : undefined,
    depthStencil);

  // Wrapped TextureTargets + history swapper
  const [source, depth] = useMemo(() => {

    const size = [width, height] as [number, number];
    let source: TextureTarget | undefined;
    let sources: TextureTarget[] | undefined;
    let depth: TextureTarget | undefined;
    let depths: TextureTarget[] | undefined;

    const swap = (history > 0) ? () => {
      const {current: index} = counter;

      if (source && sources && bufferTextures && bufferViews) {
        cycleHistorySources(
          source,
          sources,
          index,
          bufferTextures,
          bufferViews,
          colorAttachments[0],
          !!resolveTexture,
        );
      }
      if (depth && depths && depthTextures && depthViews) {
        cycleHistorySources(
          depth,
          depths,
          index,
          depthTextures,
          depthViews,
          depthStencilAttachment,
        );
      }

      counter.current = (index + 1) % (history + 1);
    } : null;
    
    if (format && targetTexture) {
      const view = targetTexture.createView();
      const volatile = (history > 0) ? history + 1 : 0;

      const type = getTextureSampleType(format);
      const layout = `texture_2d<${type}>`;

      const makeSource = () => ({
        texture: targetTexture,
        view,
        sampler,
        layout,
        format,
        variant,
        absolute,
        colorSpace,
        size,
        volatile,
        version: 0,
        hint,
        swap: undefined,
      }) as TextureTarget;

      sources = (history > 0) ? seq(history).map(makeSource) : undefined;

      source = makeSource();
      source.history = sources;
      source.swap = swap;
    }

    if (depthStencil && depthTexture) {
      const view = depthTexture.createView({ aspect: 'depth-only' });
      const volatile = history ? history + 1 : 0;

      const type = getTextureSampleType(depthStencil);
      const layout = samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d';
      
      const makeSource = () => ({
        texture: depthTexture,
        view,
        sampler,
        layout: samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d',
        format: depthStencil,
        variant,
        absolute,
        size,
        volatile,
        version: 0,
        aspect: 'depth-only',
        hint: 'depth',
        swap: undefined,
      }) as TextureTarget;

      depths = depthHistory && (history > 0) ? seq(history).map(makeSource) : undefined;

      depth = makeSource();
      depth.history = depths;
      depth.swap = swap;
    }
    
    swap?.();

    return [source, depth];
  }, [
    targetTexture, depthTexture,
    width, height, format, variant, absolute, samples, history, sampler, hint,
    bufferTextures, bufferViews, colorAttachments, colorSpace, counter, resolveTexture,
    depthStencil, depthStencilAttachment, depthTextures, depthViews,
  ]);

  // Offscreen render context
  const rttContext = useMemo(() => ({
    ...renderContext,
    width,
    height,
    samples,
    colorSpace,
    colorInput,

    colorStates,
    depthStencilState,
    
    viewType: '2d',
    viewAttachments: [{
      colorAttachments,
      depthStencilAttachment,
    }],

    swap: source?.swap ?? depth?.swap,
    source,
    depth,
  } as OffscreenRenderContext), [renderContext, width, height, depth, samples, colorInput, colorSpace, colorStates, colorAttachments, depthStencilState, depthStencilAttachment, source]);

  useMemo(() => {
    const inspectable = [source, depth].filter(s => !!s);
    inspect({
      output: {
        color: inspectable,
      },
    });
  }, [source, depth]);

  const render = getRenderFunc(props);
  if (!(render ?? children)) return yeet(rttContext);

  const content = render ? render(rttContext) : children;
  const view = provide(RenderContext, rttContext, content);

  if (then && source) return fence(view, () => then(source));
  return view;
}

const cycleHistorySources = (
  source: TextureSource,
  sources: TextureSource[],
  index: number,

  textures: GPUTexture[],
  views: GPUTextureView[],
  attachment: any,
  resolve: boolean,
) => {
  const n = textures.length;
  const history = n - 1;

  const texture = textures[index];
  const view = views[index];

  source.texture = texture;
  source.view = view;

  for (let i = 0; i < history; i++) {
    const j = (index + n - i - 1) % n;
    sources[i].texture = textures[j];
    sources[i].view = views[j];
  }

  if (attachment) {
    attachment[resolve ? 'resolveTarget' : 'view'] = view;
  }
}

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useCombinedRenderTarget = (targets: OffscreenRenderContext[]) => useMemo(() => getCombinedRenderTarget(targets), targets);

export const getCombinedRenderTarget = (targets: OffscreenRenderContext[]) => {
  const [first] = targets;

  return {
    ...first,
    colorStates: targets.flatMap(t => t.colorStates),
    viewAttachments: first.viewAttachments.map((va, i) => ({
      ...va,
      colorAttachments: targets.flatMap(t => t.viewAttachments[i].colorAttachments),
    })),
    sources: targets.map(t => t.source),
  };
};
