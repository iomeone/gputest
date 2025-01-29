import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { OffscreenRenderContext, ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { provide, fence, yeet, useContext, useMemo, useOne } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

import { useInspectable } from '../hooks/useInspectable';

import {
  makeColorState,
  makeColorAttachments,
  makeTargetTexture,
  makeDepthStencilState,
  makeDepthStencilAttachments,
  BLEND_PREMULTIPLY,
  seq,
} from '@use-gpu/core';

import zip from 'lodash/zip.js';

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderCubeTargetProps = {
  width?: number,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat | null,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,
  resolution?: number,
  variant?: string,
  absolute?: boolean,
  label?: string,

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
    width = Math.floor(renderContext.width * resolution),
    samples = renderContext.samples,
    format = PRESENTATION_FORMAT,
    history = 0,
    sampler = NO_SAMPLER,
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = EMPTY_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    variant = 'textureSample',
    absolute = false,
    label,
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
    [device, width, height, format, samples, history]
  );

  const targetTexture = resolveTexture ?? renderTexture;

  const colorStates      = useOne(() => [
    format ? makeColorState(format, format.match(/unorm|float/) ? BLEND_PREMULTIPLY : undefined) : [],
  ], format);

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

      const [attachment] = makeDepthStencilAttachments(texture, depthStencil, 1);
      const attachments = samples > 1
        ? [attachment, attachment, attachment, attachment, attachment, attachment]
        : makeDepthStencilAttachments(texture, depthStencil, layers);

      return [texture, attachments];
    },
    [device, width, height, depthStencil, samples]
  );

  const viewAttachments = useMemo(() => {
    const pairs = zip(viewColorAttachments ?? [], viewDepthStencilAttachments ?? []);
    return pairs.map(([c, d]) => ({
      colorAttachments: c ?? [],
      depthStencilAttachment: d,
    }));
  }, [viewColorAttachments, viewDepthStencilAttachments]);

  const [source, sources, depth] = useMemo(() => {

    const size = [width, height] as [number, number];
    let source: TextureTarget | undefined;
    let sources: TextureTarget[] | undefined;
    
    if (format && targetTexture) {
      const view = targetTexture.createView({ dimension: 'cube' });
      const volatile = history ? history + 1 : 0;

      //const type = TEXTURE_SAMPLE_TYPES[format];
      const layout = `texture_cube<f32>`;

      const swap = () => {
        if (!format || !history || !source || !sources) return;

        const {current: index} = counter;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const n = bufferViews!.length;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const texture = bufferTextures![index];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const view = bufferViews![index];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const layers = bufferLayers![index];

        for (let i = 0; i < 6; ++i) {
          const att = viewAttachments[i].colorAttachments[0];
          if (resolveTexture) att.resolveTarget = layers[i];
          else att.view = layers[i];
        }

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
    } as TextureSource : null;

    return [source, sources, depth];
  }, [targetTexture, depthTexture, width, height, format, variant, absolute, samples, history, sampler, depthStencil]);

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
  } as OffscreenRenderContext), [renderContext, width, height, colorStates, depthStencilState, viewAttachments, source, sources, depth]);

  const inspectable = useMemo(() => [
    ...(source ? [source] : []),
    ...(sources ?? []),
    ...(depth ? [depth] : []),
  ], [source, sources, depth]);

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
