import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { ColorSpace, TextureSource, TextureTarget } from '@use-gpu/core';

import { seq } from '@use-gpu/core';
import { provide, yeet, fence, useContext, useMemo } from '@use-gpu/live';
import { PRESENTATION_FORMAT, COLOR_SPACE } from '../constants';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { ComputeContext } from '../providers/compute-provider';

import { makeStorageTexture } from '@use-gpu/core';

const DEFAULT_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type TextureBufferProps = PropsWithChildren<{
  width?: number,
  height?: number,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  format?: GPUTextureFormat,
  colorSpace?: ColorSpace,
  samples?: number,
  resolution?: number,
  filterable?: boolean,
  label?: string,

  render?: (texture: TextureTarget) => LiveElement,
  then?: (texture: TextureTarget) => LiveElement,
}>;

/** Read-write GPU texture buffer for compute. Will perform frame-buffer flipping with N frames of history. */
export const TextureBuffer: LiveComponent<TextureBufferProps> = (props: TextureBufferProps) => {
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
    label,
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
          1,
          format,
          samples,
        );

      const buffers = history > 0 ? seq(history).map(() =>
        makeStorageTexture(
          device,
          width,
          height,
          1,
          format,
        )
      ) : null;

      let i = 0;
      if (buffers) for (const b of buffers) b.label = [label ?? 'textureBuffer', 'history', ++i].filter(s => s != null).join(' ');
      buffer.label = label ?? 'textureBuffer';

      if (buffers) buffers.push(buffer);
      const views = buffers ? buffers.map(b => b.createView()) : undefined;

      const counter = { current: 0 };

      return [buffer, buffers, views, counter];
    },
    [device, width, height, format, samples, history]
  );

  const targetTexture = bufferTexture;

  const source = useMemo(() => {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const n = bufferViews!.length;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const texture = bufferTextures![index];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const view = bufferViews![index];

      source.texture = texture;
      source.view = view;

      for (let i = 0; i < history; i++) {
        const j = (index + n - i - 1) % n;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sources![i].texture = bufferTextures![j];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    swap();

    return source;
  }, [targetTexture, width, height, format, history, sampler]);

  if (!(render ?? children)) return yeet(source);

  const content = render ? render(source) : children;
  const view = provide(ComputeContext, source, content);

  if (then) return fence(view, () => then(source));
  return view;
}
