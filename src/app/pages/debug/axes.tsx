import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, Flat, Animate, LinearRGB,
  GeometryData, PBRMaterial, ImageCubeTexture,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
  PointLight, AmbientLight,
  AxisHelper,
  ShaderFlatMaterial,

  makeSphereGeometry,
  useBoundShader,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

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

  return (
    <Gather
      children={[
        <GeometryData geometry={geometry} />,
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
        Record<string, ShaderSource>,
        TextureSource,
      ]) => {
        const fragment = useBoundShader(cubeMaterial, [texture]);

        return (
          <LinearRGB tonemap="aces">
            <Loop>
              <Cursor cursor='move' />
              <Camera>
                <Pass lights>
                  <AmbientLight intensity={0.2} />
                  <PointLight position={[-2.5, 3, 2, 1]} intensity={32} />

                  <AxisHelper size={2} width={3} />

                  <Scene>
                    <ShaderFlatMaterial fragment={fragment}>
                      <Mesh mesh={mesh} />
                    </ShaderFlatMaterial>
                  </Scene>

                </Pass>
              </Camera>
            </Loop>
          </LinearRGB>
        );
      }}
    />
  );
};

const Camera: LC = ({children}: PropsWithChildren<object>) => (
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
