import type { LC, PropsWithChildren } from '@use-gpu/live';

import React, { use } from '@use-gpu/live';

import {
  Loop, Pass, Flat,
  ArrayData, Data, RawData,
  PanControls,
  Pick, Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Present, Slide, Overlay, Step, KeyboardControls,
} from '@use-gpu/present';
import {
  UI, Layout, Absolute, Flex, Block, Inline, Text,
} from '@use-gpu/layout';
import { vec3 } from 'gl-matrix';

let t = 0;

export const PresentSlidesPage: LC = () => {
  
  return (
    <Loop>
      <LinearRGB>
        <View>
          <Pass>

            <Present>
              <KeyboardControls />

              <Overlay stay={1}>
                <Absolute left={50} bottom={50} right={50}>
                  <Block padding={[10, 10, 10, 20]} fill="#404040"><Inline><Text size={48} color="#fff" weight="bold">Lorem Ipsum</Text></Inline></Block>                  
                </Absolute>
              </Overlay>

              <Slide effect={{type: 'wipe', direction: 'left'}}>
                <Absolute left={50} top={50} bottom={50} right={50}>
                  <Block padding={[10, 10, 10, 20]} fill="#404040"><Inline><Text size={48} color="#fff" weight="bold">Use.GPU Present</Text></Inline></Block>
                  
                  <Block padding={10}>
                    <Step effect={{type: 'wipe', duration: 0.5}}>
                      <Block padding={10} margin={[0, 0, 0, 10]} fill="#404040"><Inline><Text size={24} color="#fff">Lorem ipsum dolor sit amet</Text></Inline></Block>
                    </Step>
                    <Step effect={{type: 'move', direction: 'left', duration: 1}}>
                      <Block padding={10} margin={[0, 0, 0, 10]} fill="#404040"><Inline><Text size={24} color="#fff">In reprehenderit in voluptate velit esse.</Text></Inline></Block>
                    </Step>
                  </Block>
                </Absolute>
              </Slide>
              <Slide effect={{type: 'move', direction: 'left', duration: 1}}>
                <Absolute left={50} top={50} bottom={50} right={50}>
                  <Block padding={[10, 10, 10, 20]} margin={[0, 0, 0, 10]} fill="#404040"><Inline><Text size={48} color="#fff" weight="bold">With Fancy Transitions</Text></Inline></Block>
                  
                  <Block padding={10} margin={[0, 0, 0, 10]}>
                    <Step effect={{type: 'fade', direction: 'left', duration: 0.25}}>
                      <Block padding={10} fill="#404040"><Inline><Text size={24} color="#fff">Cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text></Inline></Block>
                    </Step>
                  </Block>
                </Absolute>
              </Slide>
            </Present>

            <UI>
              <Layout>
                <Absolute bottom={10} height={40} left={10} right={10}>
                  <Flex width="100%" height="100%" align="center">
                    <Block fill={[0, 0, 0, .95]} padding={[20, 10]} radius={4}>
                      <Inline>
                        <Text color="rgba(192, 192, 192, 0.8)">Press the arrow keys to navigate</Text>
                      </Inline>
                    </Block>
                  </Flex>
                </Absolute>
              </Layout>
            </UI>

          </Pass>
        </View>
      </LinearRGB>
    </Loop>
  );
}

const View = ({children}: PropsWithChildren<object>) => (
  <PanControls
    render={(x, y, zoom) =>
      <Flat x={x} y={y} zoom={zoom}>
        {children}
      </Flat>
    }
  />
);
