import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TypedArray, DataTexture, TextureSource, UniformType, Emitter } from '@use-gpu/core/types';
import { DeviceContext, FrameContext } from '../providers';
import { yeet, memo, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import { makeRawSourceTexture, makeTextureView, uploadRawTexture } from '@use-gpu/core';

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

  const memoKey = [data.format, ...data.size].join('/');

  // Make source texture from data
  const source = useMemo(() => {
    const {size, format} = data;
    const texture = makeRawSourceTexture(device, data);
    const source = {
      texture,
      view: makeTextureView(texture),
      format,
      size,
      version: 0,
    };
    return source;
  }, [device, memoKey]);

  // Refresh and upload data
  const refresh = () => {
    uploadRawTexture(device, source.texture, data);
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

  return useMemo(() => render ? render(source) : yeet(source), [render, source]);
};
