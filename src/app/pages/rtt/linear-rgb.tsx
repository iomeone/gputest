import type { LC, PropsWithChildren } from '../../../live';
import React from '../../../live';

import {
  Pass, FlatCamera,
  OrbitCamera,
  LinearRGB,
  InterleavedData, FaceLayer,
  AmbientLight, DirectionalLight,
  PBRMaterial,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';
import {
  UI, Layout, Absolute, Block, Flex, Inline, Text
} from '../../../layout';

import { meshVertexArray, meshSchema } from '../../meshes/cube';

import { InfoBox } from '../../ui/info-box';

const lightData = [
  {
    position: [-10, 20, 15, 1],
    color: [1, 1, 1, 1],
  },
  {
    position: [-15, 20, -5, 1],
    color: [0.8, 0.4, 0.8, 1],
  },
];

export const RTTLinearRGBPage: LC = () => {

  return (<>
    <InfoBox>Use Linear RGB for gamma-correct and HDR rendering</InfoBox>
    <LinearRGB>
      <Cursor cursor='move' />
      <Camera>
        <Pass lights>
          <AmbientLight intensity={0.2} />
          <DirectionalLight position={lightData[0].position} intensity={0.75} color={lightData[0].color} />
          <DirectionalLight position={lightData[1].position} intensity={0.25} color={lightData[1].color} />

          <InterleavedData
            schema={meshSchema}
            data={meshVertexArray}
          >
            {(props) => (
              <PBRMaterial roughness={0.5}>
                <FaceLayer
                  {...props}
                  shaded
                />
              </PBRMaterial>
            )}
          </InterleavedData>
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
