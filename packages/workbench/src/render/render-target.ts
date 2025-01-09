import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { OffscreenRenderContext, ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { provide, fence, yeet, useContext, useMemo, useOne } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';

import { useInspectable } from '../hooks/useInspectable';
import { getRenderFunc } from '../hooks/useRenderProp';

import {
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLY,
  seq,
} from '@use-gpu/core';

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderTargetProps = {
  width?: number,
  height?: number,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat | null,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,
  resolution?: number,
  absolute?: boolean,
  variant?: string,

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
    width = Math.floor(renderContext.width * resolution),
    height = Math.floor(renderContext.height * resolution),
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

      return [render, resolve, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );

  const targetTexture = resolveTexture ?? renderTexture;

  const colorStates      = useOne(() => format ? [makeColorState(format, BLEND_PREMULTIPLY)] : [], format);
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
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples]
  );

  const [source, sources, depth] = useMemo(() => {

    const size = [width, height] as [number, number];
    let source: TextureTarget | undefined;
    let sources: TextureTarget[] | undefined;
    
    if (format && targetTexture) {
      const view = targetTexture.createView();
      const volatile = history ? history + 1 : 0;

      //const type = TEXTURE_SAMPLE_TYPES[format];
      const layout = `texture_2d<f32>`;

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
      sampler: {},
      layout: samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d',
      format: depthStencil,
      size,
      version: 0,
    } as TextureSource : undefined;

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
    
    viewType: '2d',
    viewAttachments: [{
      colorAttachments,
      depthStencilAttachment,
    }],

    swap: source?.swap,
    source,
    depth,
  } as OffscreenRenderContext), [renderContext, width, height, colorStates, colorAttachments, depthStencilState, depthStencilAttachment, source, sources]);

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
