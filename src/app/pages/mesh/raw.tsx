import type { LC, PropsWithChildren } from '@use-gpu/live';

import React from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, Flat,
  Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer, LineLayer,
  RenderToTexture,
} from '@use-gpu/workbench';
import { RawMesh } from './components/raw-mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export const MeshRawPage: LC = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();

  return (
    <>
      <Cursor cursor='move' />
      <Camera>
        <Pass picking>
          <Pick
            render={({id, hovered, presses}) => [
              // <RawMesh> is a fully hand-coded component, intended as an anti-example
              // of how to integrate fully custom rendering code with classic vertex attributes.
              <RawMesh texture={texture} mesh={mesh} blink={presses.left} />,
              <RawMesh id={id} texture={texture} mesh={mesh} mode={'picking'} />,
              hovered ? <Cursor cursor='pointer' /> : null,
            ]}
          />
        </Pass>
      </Camera>
    </>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
      >
        {children}
      </OrbitCamera>
    }
  />
);
