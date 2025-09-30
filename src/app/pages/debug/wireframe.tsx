import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, DataField } from '@use-gpu/core';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass,
  Cursor,
  GeometryData,
  OrbitCamera, OrbitControls,
  FaceLayer, RawQuads,
  makeBoxGeometry,
} from '@use-gpu/workbench';

import { Scene, Node, Mesh, Primitive } from '@use-gpu/scene';
import { InfoBox } from '../../ui/info-box';

// Prefab geometry
const boxGeometry = makeBoxGeometry();

export const DebugWireframePage: LC = () => {

  return (<>
    <InfoBox>Render anything as a wireframe using debug mode</InfoBox>
    <Camera>
      <Cursor cursor='move' />
      <Pass>
        <Scene>
          <Node position={[-.5, 0, 0]}>
            <GeometryData
              {...boxGeometry}
            >{
              (mesh: GPUGeometry) => <Mesh mesh={mesh} mode='debug' />
            }</GeometryData>
          </Node>
          <Node position={[.5, 0, 0]}>
            <Primitive>
              <RawQuads
                count={1}
                position={[0, 0, 0, 1]}
                rectangle={[-50, -40, 50, 40]}
                depth={1}
                mode="debug"
              />
            </Primitive>
          </Node>
        </Scene>
      </Pass>
    </Camera>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={3}
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
