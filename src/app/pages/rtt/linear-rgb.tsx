import type { LC, PropsWithChildren } from '@use-gpu/live';
import React from '@use-gpu/live';

import {
  Pass, FlatCamera,
  OrbitCamera, OrbitControls,
  Pick, Cursor, LinearRGB,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Flex, Inline, Text
} from '@use-gpu/layout';
import { RawMesh } from '../mesh/components/raw-mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

import { InfoBox } from '../../ui/info-box';

export const RTTLinearRGBPage: LC = () => {
  const mesh = makeMesh();
  const texture = makeTexture();

  return (<>
    <InfoBox>Use Linear RGB for gamma-correct and HDR rendering</InfoBox>
    <LinearRGB>
      <Cursor cursor='move' />
      <Camera>
        <Pass picking>
          <Pick
            render={({id, hovered, presses}) => [
              <RawMesh texture={texture} mesh={mesh} blink={presses.left} />,
              <RawMesh id={id} texture={texture} mesh={mesh} mode={'picking'} />,
              hovered ? <Cursor cursor='pointer' /> : null,
            ]}
          />
        </Pass>
      </Camera>
      <FlatCamera>
        <Pass overlay>
          <UI>
            <Layout>
              <Absolute
                top='50%'
                left={40}
                right={40}
                bottom={0}
              >
                <Flex align='center'>
                  <Block width={700}>
                    <Inline align={'center'}>
                      <Text size={32} color={[1, 1, 1, 1]}>
                        {"Linear RGB (float16) allows for gamma-correct blending of text and gradients.\n\n"}
                      </Text>
                      <Text size={32} color={[1, 1, 1, 0.5]}>
                        {"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, "}
                      </Text>
                      <Text size={32} color={[1, 1, 1, 0.25]}>
                        {"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
                      </Text>
                    </Inline>
                  </Block>
                </Flex>
              </Absolute>
            </Layout>
          </UI>
        </Pass>
      </FlatCamera>
    </LinearRGB>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
      >
        {children}
      </OrbitCamera>
    }
  />
);
