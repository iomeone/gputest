import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { use, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer, LineLayer,
  RenderToTexture,
} from '@use-gpu/components';
import { Mesh } from '../../components/mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export type RawMeshPage = {
  canvas: HTMLCanvasElement,
};

export const RawMeshPage: LiveComponent<RawMeshPageProps> = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();
  const {canvas} = props;

  const view = (
    use(Draw, {
      children: [
        use(Cursor, { cursor: 'move' }),
        use(Pass, {
          children:
            use(Pick, {
              render: ({id, hovered, presses}) => [
                use(Mesh, { texture, mesh, blink: presses.left }),
                use(Mesh, { id, texture, mesh, mode: RenderPassMode.Picking }),
                hovered ? use(Cursor, { cursor: 'pointer' }) : null,
              ],
            }),
        }),
      ],
    })
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
