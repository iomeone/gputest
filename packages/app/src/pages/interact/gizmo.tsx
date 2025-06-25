import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, TextureSource } from '@use-gpu/core';

import React, { Gather, useOne, useState } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData, ImageCubeTexture,
  OrbitCamera,
  PBRMaterial,

  makeBoxGeometry,
  useShader,
} from '@use-gpu/workbench';
import {
  Cursor,
  GizmoMatrix,
  OrbitControls,
} from '@use-gpu/interact';
import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

import { mat4 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';

const cubeMaterial = wgsl`
@optional @link fn getCubeMap(uvw: vec3<f32>) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn main(
  inColor: vec4<f32>,
  mapUV: vec4<f32>,
  mapST: vec4<f32>,
) -> vec4<f32> {
  return getCubeMap(mapUV.xyz);
}
`;

export const InteractGizmoPage: LC = () => {
  const geometry = useOne(() => makeBoxGeometry({ width: 0.2 }));

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
              <Pass picking>

                <Scene>
                  <GizmoMatrix value={matrix} onChange={setMatrix} />
                  <Node matrix={matrix}>
                    {/*
                    <PBRMaterial>
                      <Mesh mesh={mesh} />
                    </PBRMaterial>
                    */}
                  </Node>
                </Scene>

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
