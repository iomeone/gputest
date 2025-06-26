import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry } from '@use-gpu/core';

import React, { Gather, useOne, useState } from '@use-gpu/live';
import { mat4, vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData,
  OrbitCamera,
  Environment,
  PBRMaterial,

  makeBoxGeometry,
} from '@use-gpu/workbench';
import {
  Cursor,
  GizmoMatrix,
  OrbitControls,
} from '@use-gpu/interact';
import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';

export const InteractGizmoPage: LC = () => {
  const geometry = useOne(() => makeBoxGeometry({ width: 2 }));

  const [matrix, setMatrix] = useState(() => mat4.fromValues(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ));

  return (<>
    <InfoBox>Load a cube map using &lt;ImageCubeTexture&gt; and render it on a mesh as a &lt;ShaderFlatMaterial&gt;.</InfoBox>
    <Gather
      children={[
        <GeometryData {...geometry} />,
      ]}
      then={([
        mesh,
      ]: [
        GPUGeometry,
      ]) => {
        return (
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>
              <Pass picking lights>

                <Environment preset="park">

                  <Scene>
                    <Node matrix={matrix}>
                      <PBRMaterial>
                        <Mesh mesh={mesh} shaded />
                      </PBRMaterial>
                    </Node>
                    <GizmoMatrix
                      move
                      rotate
                      scale
                      value={matrix}
                      onChange={setMatrix}
                    />
                  </Scene>

                </Environment>

              </Pass>
            </Camera>
          </LinearRGB>
        );
      }}
    />
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={-0.5}
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
