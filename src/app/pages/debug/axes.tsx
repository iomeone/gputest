import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData, ImageCubeTexture,
  OrbitCamera, OrbitControls,
  Cursor,
  AxisHelper,
  ShaderFlatMaterial,

  makeSphereGeometry,
  useShader,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

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

export const DebugAxesPage: LC = (props) => {
  const geometry = useOne(() => makeSphereGeometry({ width: 2, uvw: true }));

  return (<>
    <InfoBox>Load a cube map using &lt;ImageCubeTexture&gt; and render it on a mesh as a &lt;ShaderFlatMaterial&gt;.</InfoBox>
    <Gather
      children={[
        <GeometryData {...geometry} />,
        <ImageCubeTexture urls={[
          "/textures/cube/uv/px.png",
          "/textures/cube/uv/nx.png",
          "/textures/cube/uv/py.png",
          "/textures/cube/uv/ny.png",
          "/textures/cube/uv/pz.png",
          "/textures/cube/uv/nz.png",
        ]} />,
      ]}
      then={([
        mesh,
        texture,
      ]: [
        GPUGeometry,
        TextureSource,
      ]) => {
        const fragment = useShader(cubeMaterial, [texture]);

        return (
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>
              <Pass>
                <AxisHelper size={2} width={3} />

                <Scene>
                  <ShaderFlatMaterial fragment={fragment}>
                    <Mesh mesh={mesh} />
                  </ShaderFlatMaterial>
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
