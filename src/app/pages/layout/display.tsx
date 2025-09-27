import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';

import {
  Draw, Pass, Flat, UI, Layout, Absolute, Block, Flex, Inline, Text, Element,
} from '@use-gpu/components';
import { makeTexture } from '../../meshes/cube';

export const LayoutDisplayPage: LC = () => {
  const texture = makeTexture();

  const view = (
    <Draw>
      <Pass>
        <Flat>
          <UI>
            <Layout>
              <Flex width="100%" height="100%">
                <Block width="34%" height={500}>
                  <Absolute>
                    <Element fill={[0, 0, 0, .5]} margin={10} />
                  </Absolute>
                </Block>
                <Block width="66%" height="100%">
                  <Element fill={[0, 0, 0, .5]} />
                </Block>
              </Flex>
            </Layout>
          </UI>
        </Flat>
      </Pass>
    </Draw>
  );

  return view;
};
