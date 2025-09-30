import type { LC, LiveElement, PropsWithChildren, PropsWithMarkup } from '@use-gpu/live';
import type { ColorLike } from '@use-gpu/core';

import React, { use } from '@use-gpu/live';

import {
  Pass, FlatCamera,
  PanControls,
  Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Present, Slide, Overlay, Step, PresentInfo, KeyboardControls,
} from '@use-gpu/present';
import {
  UI, Layout, Absolute, Flex, Block, Inline, Text,
} from '@use-gpu/layout';
import { vec3 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';

let t = 0;

type TextProps = {
  fill?: ColorLike,
  align?: 'start' | 'center' | 'end',
};

const List = ({children}: PropsWithChildren<object>) => (
  <Block padding={10} margin={[0, 40, 0, 0]}>{children}</Block>
);

const Title = ({align, children}: PropsWithMarkup<TextProps>) => (
  <Block padding={[10, 10, 10, 20]}>
    <Inline align={align}>
      <Text size={48} color="#fff" weight="bold">{children}</Text>
    </Inline>
  </Block>
);

const ListItem = ({align, fill, children}: PropsWithMarkup<TextProps>) => (
  <Block padding={10} margin={[0, 0, 0, 10]} fill={fill}>
    <Inline align={align}>
      <Text size={24} color="#fff">{children}</Text>
    </Inline>
  </Block>
);

const Bold = ({children}: PropsWithMarkup<object>) => (
  <Text size={24} weight="bold" color="#fff">{children}</Text>
);

export const PresentSlidesPage: LC = () => {

  return (<>
    <InfoBox>Render animated, reactive presentation slides using the Present package</InfoBox>
    <LinearRGB>
      <View>
        <Pass>

          <Present>
            <KeyboardControls />

            <Slide effect={{type: 'wipe', direction: 'left'}}>
              <Absolute left={50} top={50} bottom={50} right={50}>
                <Title>Use.GPU Present</Title>

                <List>
                  <Step effect={{type: 'wipe', duration: 0.5}}>
                    <ListItem>• Supports classic slides with builds</ListItem>
                  </Step>
                  <Step effect={{type: 'move', direction: 'left', duration: 1}}>
                    <ListItem>• Composes with <Bold>@use-gpu/layout</Bold></ListItem>
                  </Step>
                  <Step effect={{type: 'move', direction: 'down', duration: 1}}>
                    <ListItem>• Wrap presentation in <Bold>&lt;Present&gt;</Bold></ListItem>
                  </Step>
                  <Step effect={{type: 'move', direction: 'up', duration: 1}}>
                    <ListItem>• Wrap elements in <Bold>&lt;Slide&gt;</Bold> and <Bold>&lt;Step&gt;</Bold></ListItem>
                  </Step>
                </List>
              </Absolute>
            </Slide>

            <Overlay stay={1}>
              <Absolute left={50} bottom={150} right={50}>
                <ListItem align="center" fill="#404040">Overlay across slides</ListItem>
              </Absolute>
            </Overlay>

            <Slide effect={{type: 'move', direction: 'left', duration: 1}}>
              <Absolute left={50} top={50} bottom={50} right={50}>
                <Title>With Fancy Transitions</Title>

                <List>
                  <Step effect={{type: 'wipe', direction: 'right', duration: 0.5}}>
                    <ListItem>Elements are driven using a CSS-transform like mechanism.</ListItem>
                  </Step>
                  <Step effect={{type: 'wipe', direction: 'right', duration: 0.5}}>
                    <ListItem>Slides are driven using a dedicated compositor.</ListItem>
                  </Step>
                </List>
              </Absolute>
            </Slide>
            <Slide effect={{type: 'move', direction: 'left', duration: 1}}>
              <Absolute left={50} top={50} bottom={50} right={50}>
                <Flex align="center" width="100%" height="100%">
                  <Block><Inline><Text size={48} color="#fff">The End</Text></Inline></Block>
                </Flex>
              </Absolute>
            </Slide>

            <UI>
              <Layout>
                <Absolute bottom={100} height={40} left={10} right={10}>
                  <Flex width="100%" height="100%" align="center">
                    <Block fill={[0, 0, 0, .95]} padding={[20, 10]} radius={4}>
                      <PresentInfo>{(step: number, length: number) => (
                        <Inline align="center">
                          <Text color="rgba(255, 255, 255, 0.8)" size={24}>{step} / {length}</Text>
                        </Inline>
                      )}</PresentInfo>
                      <Inline>
                        <Text color="rgba(192, 192, 192, 0.8)">Press the arrow keys to navigate</Text>
                      </Inline>
                    </Block>
                  </Flex>
                </Absolute>
              </Layout>
            </UI>
          </Present>

        </Pass>
      </View>
    </LinearRGB>
  </>);
}

const View = ({children}: PropsWithChildren<object>) => (
  <PanControls
    render={(x, y, zoom) =>
      <FlatCamera x={x} y={y} zoom={zoom}>
        {children}
      </FlatCamera>
    }
  />
);
