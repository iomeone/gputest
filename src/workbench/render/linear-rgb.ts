import type { LiveComponent, LiveElement } from '../../live';
import type { TextureSource, ColorSpace } from '../../core';
import type { ShaderModule } from '../../shader';

import { use, useOne } from '../../live';
import { Draw } from './draw';
import { Pass } from './pass';
import { RenderToTexture, RenderToTextureProps } from './render-to-texture';
import { RawFullScreen } from '../primitives';

//export type LinearRGBProps = Omit<RenderToTextureProps, "format" | "colorSpace">;
export type LinearRGBProps = {
  width?: number,
  height?: number,
  live?: boolean,
  history?: number,
  sampler?: Partial<GPUSamplerDescriptor>,
  //format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat | null,
  backgroundColor?: GPUColor,
  //colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,

  children?: LiveElement<any>,
  then?: (texture: TextureSource) => LiveElement<any>,
};

export const LinearRGB: LiveComponent<LinearRGBProps> = (props: LinearRGBProps) => ( 
  use(RenderToTexture, {
    ...props,
    format: "rgba16float",
    colorSpace: 'linear',
    then: (texture: TextureSource) => 
      useOne(() =>
        use(Draw, {
          children:
            use(Pass, {
              picking: false,
              children:
                use(RawFullScreen, {
                  texture,
                }),
            }),
        }),
        texture
      )
  })
);

