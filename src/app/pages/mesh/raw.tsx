import type { LC } from '@use-gpu/live';

import React from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer, LineLayer,
  RenderToTexture,
} from '@use-gpu/workbench';
import { Mesh } from '../../components/mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export const MeshRawPage: LC = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();

  const view = (
    <Draw>
      <Cursor cursor='move' />
      <Pass>
        <Pick
          render={({id, hovered, presses}) => [
            <Mesh texture={texture} mesh={mesh} blink={presses.left} />,
            <Mesh id={id} texture={texture} mesh={mesh} mode={'picking'} />,
            hovered ? <Cursor cursor='pointer' /> : null,
          ]}
        />
      </Pass>
    </Draw>
  );

  return (
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
          {view}
        </OrbitCamera>
      }
    />
  );
};
