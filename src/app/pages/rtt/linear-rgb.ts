import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { wrap, use, useMemo, useOne, useResource, useState } from '@use-gpu/live';

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
    wrap(LinearRGB, [
      use(Cursor, { cursor: 'move' }),
      wrap(Pass, [
        use(Pick, {
          render: ({id, hovered, presses}) => [
            use(Mesh, { texture, mesh, blink: presses.left }),
            use(Mesh, { id, texture, mesh, mode: RenderPassMode.Picking }),
            hovered ? use(Cursor, { cursor: 'pointer' }) : null,
          ],
        }),

        wrap(Flat, 
          wrap(UI,
            wrap(Layout,
              use(Absolute, {
                top: '50%',
                left: 40,
                right: 40,
                bottom: 0,
                children:
                  use(Flex, {
                    align: 'center',
                    children:
                      use(Block, {
                        width: 700,
                        children:
                          use(Inline, {
                            align: 'center',
                            margin: [0, 32, 0, 0],
                            children: [

                              use(Text, {
                                size: 32,
                                color: [1, 1, 1, 1],
                                content: "Linear RGB (float16) allows for gamma-correct blending of text and gradients.\n\n"
                              }),
                              use(Text, {
                                size: 32,
                                color: [1, 1, 1, 0.5],
                                content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, "
                              }),
                              use(Text, {
                                size: 32,
                                color: [1, 1, 1, 0.25],
                                content: "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                              }),

                            ],
                          }),                      
                      })
                  })
              }),
            ),
          ),
        ),
      ])
    ])
  );

  return (
    use(OrbitControls, {
      canvas,
      radius: 5,
      bearing: 0.5,
      pitch: 0.3,
      render: (radius: number, phi: number, theta: number) =>
        use(OrbitCamera, {
          radius, phi, theta,
          children: view,
        })  
    })
  );
};
