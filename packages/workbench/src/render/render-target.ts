import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Blending, OffscreenRenderContext, ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { provide, fence, yeet, useContext, useMemo, useOne } from '@use-gpu/live';
import { TEXTURE_SAMPLE_TYPES } from '@use-gpu/core';
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
    width = Math.ceil(renderContext.width * resolution + overscan * 2),
    height = Math.ceil(renderContext.height * resolution + overscan * 2),
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

  const [
    depthTexture,
    depthStencilAttachment,
  ] = useMemo(() => {
      if (!depthStencil) return [];

      const texture = makeTargetTexture(device, width, height, 1, depthStencil, samples);
      const attachment = makeDepthStencilAttachment(texture, depthStencil);
      if (label != null) texture.label = `${label} Depth`;
      
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples, label]
  );

  const [source, depth] = useMemo(() => {

    const size = [width, height] as [number, number];
    let source: TextureTarget | undefined;
    let sources: TextureTarget[] | undefined;
    
    if (format && targetTexture) {
      const view = targetTexture.createView();
      const volatile = history ? history + 1 : 0;

      const type = TEXTURE_SAMPLE_TYPES[format];
      const layout = `texture_2d<${type}>`;

      const swap = () => {
        if (!format || !history || !source || !sources) return;

        const {current: index} = counter;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const n = bufferViews!.length;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const texture = bufferTextures![index];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const view = bufferViews![index];

        if (resolveTexture) colorAttachments[0].resolveTarget = view;
        else colorAttachments[0].view = view;

        source.texture = texture;
        source.view = view;

        for (let i = 0; i < history; i++) {
          const j = (index + n - i - 1) % n;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sources[i].texture = bufferTextures![j];
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sources[i].view = bufferViews![j];
        }

        counter.current = (index + 1) % n;
      };

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

      sources = history ? seq(history).map(makeSource) : undefined;

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
    } as TextureSource : undefined;

    return [source, depth];
  }, [targetTexture, depthTexture, width, height, format, variant, absolute, samples, history, sampler, depthStencil, hint, bufferTextures, bufferViews, colorAttachments, colorSpace, counter, resolveTexture]);

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

    swap: source?.swap,
    source,
    depth,
  } as OffscreenRenderContext), [renderContext, width, height, depth, samples, colorInput, colorSpace, colorStates, colorAttachments, depthStencilState, depthStencilAttachment, source]);

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
