import type { LC } from '@use-gpu/live';
import React, { Gather, Yeet } from '@use-gpu/live';

import {
  LinearRGB, Pass, PanControls, Flat,
  DebugAtlas, RawTexture, DebugProvider,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Inline, Text,
} from '@use-gpu/layout';

import { GlyphControls } from '../../ui/glyph-controls';

export const DebugAtlasPage: LC = () => {

  const view = (
    <LinearRGB>
      <Pass>
        <UI>
          <Gather then={
            (layout: any) => [
              <Yeet>{layout}</Yeet>,
              <DebugAtlas />,
            ]
          }>
            <Layout>
              <Absolute
                left={10}
                top='70%'
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
                    family="Lato, Noto Emoji"
                    text={" is ⭐️✨✌️🌿🌳🐲🐬🍅🍲🫕🏀🏈🏴‍☠️👨‍🚀❤️‍🔥 presented which allows improved rendering of glyphs composed of curved and linear elements. A distance field is generated from a glyph image, and then stored into a channel of an RGBA texture.\n\nIn the simplest case, this texture can then be rendered simply by using the alpha-testing and alpha-thresholding feature of modern GPUs, without a custom shader. This allows the technique to be used on even the lowest-end 3D graphics hardware."}
                    color={[0.5, 0.5, 0.5, 1]}
                  />
                 {/*    */}
                </Inline>
              </Absolute>
            </Layout>
          </Gather>
        </UI>
      </Pass>
    </LinearRGB>
  );
  
  const root = document.querySelector('#use-gpu .canvas');
  
  return (
    <GlyphControls
      container={root}
      hasContours
      render={({subpixel, contours}) =>
        <PanControls
          key="atlas"
          active={true}
          render={(x, y, zoom) =>
            <Flat x={x} y={y} zoom={zoom}>
              <DebugProvider
                debug={{
                  sdf2d: { subpixel, contours },
                }}
              >
                {view}
              </DebugProvider>
            </Flat>
          }
        />
    } />
  )
};
