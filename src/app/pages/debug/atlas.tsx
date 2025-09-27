import { LiveComponent } from '@use-gpu/live/types';
import React, { Gather, Yeet } from '@use-gpu/live/jsx';

import {
  Draw, Pass,
  Flat, UI, Layout, Absolute, Inline, Text,
  DebugAtlas, RawTexture,
} from '@use-gpu/components';

export type DebugAtlasPageProps = {
  canvas: HTMLCanvasElement,
};

export const DebugAtlasPage: LiveComponent<DebugAtlasPageProps> = (props) => {
  const {canvas} = props;

  return (
    <Draw>
      <Pass>
        <Flat>
          <UI>
            <Gather>
              <Layout>
                <Absolute
                  left={10}
                  top='50%'
                  right={10}
                  bottom={10}
                >
                  <Inline align='justify-start'>
                    <Text
                      size={60}
                      snap={false}
                      text="A simple and efficient method"
                      weight="bold"
                      color={[0.5, 0.5, 0.5, 1]}
                    />
                    <Text
                      size={60}
                      snap={false}
                      text={" is presented which allows improved rendering of glyphs composed of curved and linear elements. A distance field is generated from a high resolution image, and then stored into a channel of a lower-resolution texture.\n\nIn the simplest case, this texture can then be rendered simply by using the alpha-testing and alpha-thresholding feature of modern GPUs, without a custom shader. This allows the technique to be used on even the lowest-end 3D graphics hardware."}
                      color={[0.5, 0.5, 0.5, 1]}
                    />
                  </Inline>
                </Absolute>
              </Layout>
              {(layout: any) => [
                <Yeet>{layout}</Yeet>,
                <DebugAtlas />,
              ]}
            </Gather>
          </UI>
        </Flat>
      </Pass>
    </Draw>
  );
};
