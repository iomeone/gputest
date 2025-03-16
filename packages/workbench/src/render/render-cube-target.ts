import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Blending, OffscreenRenderContext, ColorSpace, RenderViewAttachment, TextureSource, TextureTarget } from '@use-gpu/core';

import { provide, fence, yeet, useContext, useMemo, useOne } from '@use-gpu/live';
import { getTextureSampleType } from '@use-gpu/core';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

import { useInspectable } from '../hooks/useInspectable';

import {
  makeBlendState,
  makeColorState,
  makeColorAttachments,
  makeTargetTexture,
  makeDepthStencilState,
  makeDepthStencilAttachments,
  getDefaultBlendMode,
  seq,
} from '@use-gpu/core';

import zip from 'lodash/zip.js';

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderCubeTargetProps = {
  width?: number,
  history?: number,
  samples?: number,
  resolution?: number,

  format?: GPUTextureFormat | null,
  depthStencil?: GPUTextureFormat | null,
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

/** Off-screen cube render target.

Place `@{<Pass>}` directly inside, or leave empty to use yielded target with `@{<RenderToTexture>}`.
*/
export const RenderCubeTarget: LiveComponent<RenderCubeTargetProps> = (props: RenderCubeTargetProps) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const inspect = useInspectable();

  const {
    resolution = 1,
    width = Math.ceil(renderContext.width * resolution),
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    history = 0,
    sampler = NO_SAMPLER,
    depthStencil = DEPTH_STENCIL_FORMAT,
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

  const height = width;

  const [renderTexture, resolveTexture, bufferTextures, bufferViews, bufferLayers, counter] = useMemo(
    () => {
      const counter = { current: 0 };
      if (!format) return [null, null, null, null, null, counter];

      const render = 
        makeTargetTexture(
          device,
          width,
          height,
          samples > 1 ? 1 : 6,
          format,
          samples,
        );

      const resolve = samples > 1 ?
        makeTargetTexture(
          device,
          width,
          height,
          6,
          format,
        ) : null;

      const buffers = history > 0 ? seq(history).map(() =>
        makeTargetTexture(
          device,
          width,
          height,
          6,
          format,
        )
      ) : null;
      if (buffers) buffers.push(resolve ?? render);

      const views = buffers ? buffers.map(b => b.createView({
        dimension: 'cube',
      })) : undefined;

      const layers = buffers ? buffers.map(b => seq(6).map(i =>
        b.createView({
          baseArrayLayer: i,
          arrayLayerCount: 1,
        })
      )) : undefined;

      if (label != null) {
        render.label = label;
        if (resolve) resolve.label = label;

        if (buffers) for (const b of buffers) b.label = label;
        if (views) for (const v of views) v.label = label;
        if (layers) for (const ls of layers) for (const l of ls) l.label = label;
      }

      return [render, resolve, buffers, views, layers, counter];
    },
    [device, width, height, format, samples, history, label]
  );

  const targetTexture = resolveTexture ?? renderTexture;

  const colorStates = useOne(() => (
    format ? [makeColorState(format, makeBlendState(blend ?? getDefaultBlendMode(format)))] : []
  ), format);

  const viewColorAttachments = useMemo(() =>
    renderTexture || resolveTexture
      ? makeColorAttachments(renderTexture, resolveTexture, 6, backgroundColor).map(c => [c])
      : undefined,
    [renderTexture, resolveTexture, backgroundColor]
  );

  const depthStencilState = useOne(() => depthStencil
    ? makeDepthStencilState(depthStencil)
    : undefined,
    depthStencil);

  const [
    depthTexture,
    viewDepthStencilAttachments,
  ] = useMemo(() => {
      if (!depthStencil) return [];

      const layers = samples > 1 ? 1 : 6;
      const texture = makeTargetTexture(device, width, height, layers, depthStencil, samples);
      if (label != null) texture.label = `${label} Depth`;

      const [attachment] = makeDepthStencilAttachments(texture, depthStencil, 1);
      const attachments = samples > 1
        ? [attachment, attachment, attachment, attachment, attachment, attachment]
        : makeDepthStencilAttachments(texture, depthStencil, layers);

      return [texture, attachments];
    },
    [device, width, height, depthStencil, samples, label]
  );

  const viewAttachments = useMemo(() => {
    const pairs = zip(viewColorAttachments ?? [], viewDepthStencilAttachments ?? []);
    return pairs.map(([c, d]) => ({
      colorAttachments: c ?? [],
      depthStencilAttachment: d,
    }));
  }, [viewColorAttachments, viewDepthStencilAttachments]);

  const [source, depth] = useMemo(() => {

    const size = [width, height] as [number, number];
    let source: TextureTarget | undefined;
    let sources: TextureTarget[] | undefined;

    const swap = (history > 0) ? () => {
      const {current: index} = counter;

      if (source && sources && bufferTextures && bufferViews && bufferLayers) {
        cycleHistorySources(
          source,
          sources,
          index,

          bufferTextures,
          bufferViews,
          bufferLayers,
          viewAttachments,
          !!resolveTexture,
        );
      }

      counter.current = (index + 1) % n;
    } : null;

    if (format && targetTexture) {
      const view = targetTexture.createView({ dimension: 'cube' });
      const volatile = (history > 0) ? history + 1 : 0;

      const type = getTextureSampleType(format);
      const layout = `texture_cube<${type}>`;

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
        swap: null as any,
      }) as TextureTarget;

      sources = (history > 0) ? seq(history).map(makeSource) : undefined;

      source = makeSource();
      source.history = sources;
      source.swap = swap;

      swap();
    }

    const depth = depthStencil ? {
      texture: depthTexture,
      sampler,
      layout: samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d',
      format: depthStencil,
      variant,
      absolute,
      size,
      version: 0,
      hint: 'depth',
    } as TextureSource : null;

    return [source, depth];
  }, [targetTexture, depthTexture, width, height, format, variant, absolute, samples, history, sampler, depthStencil, hint, bufferLayers, bufferTextures, bufferViews, colorSpace, counter, resolveTexture, viewAttachments]);

  const rttContext = useMemo(() => ({
    ...renderContext,
    width,
    height,
    samples,
    colorSpace,
    colorInput,

    colorStates,
    depthStencilState,

    viewType: 'cube',
    viewAttachments,

    swap: source?.swap,
    source,
    depth,
  } as OffscreenRenderContext),
  [renderContext, width, height, depth, samples, colorInput, colorSpace, colorStates, depthStencilState, viewAttachments, source]);

  const inspectable = useMemo(() => [
    ...(source ? [source] : []),
    ...(depth ? [depth] : []),
  ], [source, depth]);

  inspect({
    output: {
      color: inspectable,
    },
  });

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
  layers: GPUTextureView[][],

  viewAttachments: RenderViewAttachment[],
  resolve: boolean,
) => {
  const n = textures.length;

  const texture = textures[index];
  const view = views[index];
  const ls = layers[index];

  source.texture = texture;
  source.view = view;

  for (let i = 0; i < history; i++) {
    const j = (index + n - i - 1) % n;
    sources[i].texture = textures[j];
    sources[i].view = views[j];
  }

  if (attachments) {
    for (let i = 0; i < 6; ++i) {
      const att = viewAttachments[i].colorAttachments[0];
      att[resolve ? 'resolveTarget' : 'view'] = ls[i];
    }
  }
}
