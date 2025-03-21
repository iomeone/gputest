import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, TextureSource } from '@use-gpu/core';

import React, { Gather, useOne } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData, ImageCubeTexture,
  OrbitCamera, OrbitControls,
  Cursor,
  AxisHelper,
  ShaderFlatMaterial,

  makeBoxGeometry,
  useShader,
} from '@use-gpu/workbench';

import {
  Scene, Mesh,
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

export const DebugEasePage: LC = () => {
  const geometry = useOne(() => makeBoxGeometry({ width: 2 }));

  return (<>
    <InfoBox>Easing.</InfoBox>
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
              <Pass>
                <AxisHelper size={2} width={3} />

                <Scene>
                  <Mesh mesh={mesh} />
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
