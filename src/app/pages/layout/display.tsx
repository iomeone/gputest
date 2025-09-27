import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';

import {
  Draw, Pass, Flat, UI, Layout, Absolute, Block, Flex, Inline, Text, Element,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
} from '@use-gpu/components';
import { Mesh } from '../../components/mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export type LayoutDisplayPageProps = {
};

export const LayoutDisplayPage: LiveComponent<LayoutDisplayPageProps> = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();
  const {canvas} = props;

  const view = (
    <Draw>
      <Cursor cursor='move' />
      <Pass>
        <Flat>
          <UI>
            <Layout>
              <Flex width="100%" height="100%">
                <Block width="34%">
                  <Element height={100} />
                </Block>
                <Block width="66%">
                  <Element />
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
