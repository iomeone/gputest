import { LiveComponent, LiveElement } from '../../live/types';
import { TextureSource } from '../../core/types';

import { use, useOne } from '../../live';
import { Draw } from './draw';
import { Pass } from './pass';
import { RenderToTexture } from './render-to-texture';
import { TextureShader } from '../shader';
import { RawFullScreen } from '../primitives';

type LinearRGBProps = {
  children?: LiveElement<any>,
};

export const LinearRGB: LiveComponent<LinearRGBProps> = ({children}: LinearRGBProps) => ( 
  use(RenderToTexture, {
    format: "rgba16float",
    colorSpace: 'linear',
    children,
    then: (texture: TextureSource) => 
      useOne(() =>
        use(Draw, {
          children:
            use(Pass, {
              picking: false,
              children:
                use(TextureShader, {
                  texture,
                  render: (texture: ShaderModule) => 
                    use(RawFullScreen, {
                      texture,
                    }),
                }),
            }),
        }),
        texture
      )
  })
);

