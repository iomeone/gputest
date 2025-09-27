import { LiveComponent } from '../../../live/types';
import { CanvasRenderingContextGPU } from '../../../webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '../../../core/types';

import React from '../../../live/jsx';

import {
  Draw, Pass, Flat, UI, Layout, Absolute, Block, Flex, Inline, Text, Element,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
} from '../../../components';
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
