import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';

import {
  Draw, Pass, Flat, UI, Layout, Absolute, Block, Flex, Inline, Text,
  OrbitCamera, OrbitControls,
  Pick, Cursor, LinearRGB,
} from '@use-gpu/components';
import { Mesh } from '../../components/mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export type LinearRGBPageProps = {
  canvas: HTMLCanvasElement,
};

export const LinearRGBPage: LiveComponent<LinearRGBPageProps> = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();
  const {canvas} = props;

  const view = (
    <LinearRGB>
      <Cursor cursor='move' />
      <Pass>
        <Pick
          render={({id, hovered, presses}) => [
            <Mesh texture={texture} mesh={mesh} blink={presses.left} />,
            <Mesh id={id} texture={texture} mesh={mesh} mode={RenderPassMode.Picking} />,
            hovered ? <Cursor cursor='pointer' /> : null,
          ]}
        />
        <Flat>
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
        </Flat>
      </Pass>
    </LinearRGB>
  );

  return (
    <OrbitControls
      canvas={canvas}
      radius={5}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
        >
          {view}
        </OrbitCamera>
      }
    />
  );
};
