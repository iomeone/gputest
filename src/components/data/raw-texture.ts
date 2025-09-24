import { LiveComponent, LiveElement } from '../../live/types';
import { TypedArray, DataTexture, TextureSource, UniformType, Emitter } from '../../core/types';
import { DeviceContext, FrameContext } from '../providers';
import { yeet, memo, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '../../live';
import { makeSampler, makeRawSourceTexture, makeTextureView, uploadDataTexture } from '../../core';

export type RawTextureProps = {
  data?: DataTexture,
  live?: boolean,

  render?: (source: TextureSource) => LiveElement<any>,
};

export const RawTexture: LiveComponent<RawTextureProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    render,
    live = false,
  } = props;

  const memoKey = data ? [data.format, ...data.size].join('/') : null;

  // Make source texture from data
  const source = useMemo(() => {
    if (!data) return null;

    const {size, format} = data;
    const texture = makeRawSourceTexture(device, data);
    const source = {
      texture,
      view: makeTextureView(texture),
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
      } as GPUSamplerDescriptor,
      layout: 'texture_2d<f32>',
      format,
      size,
      version: 0,
    };
    return source;
  }, [device, memoKey]);

  // Refresh and upload data
  const refresh = () => {
    if (!source || !data) return;

    uploadDataTexture(device, source.texture, data);
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoContext(FrameContext);
    useMemo(refresh, [device, source, data]);
  }
  else {
    useContext(FrameContext);
    useNoMemo();
    refresh();
  }

  return useMemo(() => source ? (render ? render(source) : yeet(source)) : null, [render, source]);
};
