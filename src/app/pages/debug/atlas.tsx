import type { LC } from '@use-gpu/live';
import React, { Gather, Yeet } from '@use-gpu/live';

import {
  LinearRGB, Pass, PanControls, FlatCamera, DebugAtlas, DebugProvider,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Inline, Text, Embed,
} from '@use-gpu/layout';

import { GlyphControls } from '../../ui/glyph-controls';
import { InfoBox } from '../../ui/info-box';

export const DebugAtlasPage: LC = () => {

  const view = (
    <LinearRGB>
      <Pass>
        <UI>
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
              </Inline>
            </Absolute>
            <Embed width={500} height={500}><DebugAtlas /></Embed>
          </Layout>
        </UI>
      </Pass>
    </LinearRGB>
  );

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Text rendering is accomplished using SDFs stored in an atlas</InfoBox>
    <GlyphControls
      container={root}
      hasContours
      render={({subpixel, contours}) =>
        <DebugProvider
          debug={{
            sdf2d: { subpixel, contours },
          }}
        >
          <PanControls
            key="atlas"
            active={true}
            render={(x, y, zoom) =>
              <FlatCamera x={x} y={y} zoom={zoom}>
                {view}
              </FlatCamera>
            }
          />
        </DebugProvider>
    } />
  </>)
};
