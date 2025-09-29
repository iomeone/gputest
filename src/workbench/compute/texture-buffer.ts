import type { LiveFiber, LiveComponent, LiveElement, Task, PropsWithChildren } from '@use-gpu/live';
import type { ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { use, provide, gather, yeet, fence, useCallback, useContext, useFiber, useMemo, useOne, incrementVersion } from '@use-gpu/live';
import { PRESENTATION_FORMAT, DEPTH_STENCIL_FORMAT, COLOR_SPACE, EMPTY_COLOR } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { ComputeContext } from '../providers/compute-provider';

import { makeStorageTexture } from '@use-gpu/core';

const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

const DEFAULT_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type TextureBufferProps = {
  width?: number,
  height?: number,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat,
  colorSpace?: ColorSpace,
  samples?: number,
  resolution?: number,
  filterable?: boolean,

  render?: (texture: TextureTarget) => LiveElement,
  then?: (texture: TextureTarget) => LiveElement,
};

/** Read-write GPU texture buffer for compute. Will perform frame-buffer flipping with N frames of history. */
export const TextureBuffer: LiveComponent<TextureBufferProps> = (props: PropsWithChildren<TextureBufferProps>) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    resolution = 1,
    width = Math.floor(renderContext.width * resolution),
    height = Math.floor(renderContext.height * resolution),
    samples = 1,
    format = PRESENTATION_FORMAT,
    history = 0,
    filterable = false,
    sampler = DEFAULT_SAMPLER,
    colorSpace = COLOR_SPACE,
    children,
    render,
    then,
  } = props;

  const [bufferTexture, bufferTextures, bufferViews, counter] = useMemo(
    () => {
      const buffer =
        makeStorageTexture(
          device,
          width,
          height,
          format,
          samples,
        );

      const buffers = history > 0 ? seq(history).map(() =>
        makeStorageTexture(
          device,
          width,
          height,
          format,
        )
      ) : null;
      if (buffers) buffers.push(buffer);      

      const views = buffers ? buffers.map(b => b.createView()) : undefined;

      const counter = { current: 0 };

      return [buffer, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );

  const targetTexture = bufferTexture;

  const [source, sources] = useMemo(() => {
    const view = targetTexture.createView();
    const size = [width, height] as [number, number];
    const volatile = history ? history + 1 : 0;
    const layout = 'texture_2d<f32>';

    const variant = filterable
      ? (format.match(/32float$/) ? 'UNSUPPORTED' : 'textureSample')
      : 'textureLoad';

    const swap = () => {
      if (!history) return;
      const {current: index} = counter;
      const n = bufferViews!.length;

      const texture = bufferTextures![index];
      const view = bufferViews![index];

      source.texture = texture;
      source.view = view;

      for (let i = 0; i < history; i++) {
        const j = (index + n - i - 1) % n;
        sources![i].texture = bufferTextures![j];
        sources![i].view = bufferViews![j];
      }

      counter.current = (index + 1) % n;
    };
    
    const makeSource = () => ({
      texture: targetTexture,
      view,
      sampler,
      layout,
      variant,
      format,
      colorSpace,
      size,
      volatile,
      version: 0,
    }) as TextureSource;

    const sources = history ? seq(history).map(makeSource) : undefined;

    const source = makeSource() as any as TextureTarget;
    source.swap = swap;
    source.history = sources;

    return [source, sources];
  }, [targetTexture, width, height, format, history, sampler]);

  if (!(render ?? children)) return yeet(source);

  const content = render ? render(source) : children;
  const view = provide(ComputeContext, source, content);

  if (then) return fence(view, () => then(source));
  return view;
}
