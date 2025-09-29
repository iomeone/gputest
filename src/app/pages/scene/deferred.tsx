import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource, TextureSource, UniformType } from '@use-gpu/core';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, Flat, Animate, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture,
  OrbitCamera, OrbitControls,
  Cursor,
  DirectionalLight, PointLight, AmbientLight,
  Data, PointLayer,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh, Instances,
} from '@use-gpu/scene';

const SHADOW_MAP_DIRECTIONAL = {
  size: [2048, 2048],
  span: [50, 50],
  depth: [0, 250],
  bias: [1/2048, 1/32],
  blur: 4,
};

const SHADOW_MAP_POINT = {
  size: [2048, 2048],
  depth: [0.1, 50],
  bias: [1, 1/32],
  blur: 4,
};

const seq = (n: number, s: number = 0, d: number = 1): number[] => Array.from({ length: n }).map((_, i: number) => s + d * i);

const sampler = {
  addressModeU: 'repeat',
  addressModeV: 'repeat',
} as GPUSamplerDescriptor;

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

const lightFields = [
  ['vec4<f32>', 'position'],
  ['vec4<f32>', 'color'],
] as [UniformType, string][];

const lightData = [
  {
    position: [-10, 20, 15, 1],
    color: [1, 1, 1, 1],
  },
  {
    position: [-15, 20, -5, 1],
    color: [0.8, 0.4, 0.8, 1],
  },
  {
    position: [2, 4.5, 2.5, 1],
    color: [0.3, 0.8, 1.0, 1],
  },
];

export const SceneDeferredPage: LC = (props) => {

  return (
    <Gather
      children={[
        <GeometryData geometry={boxGeometry} />,
        <GeometryData geometry={planeGeometry} />,
        <GeometryData geometry={sphereGeometry} />,
        <ImageTexture url="/textures/test.png" sampler={sampler} />,
      ]}
      then={([
        boxMesh,
        planeMesh,
        sphereMesh,
        texture,
      ]: [
        Record<string, StorageSource>,
        Record<string, StorageSource>,
        Record<string, StorageSource>,
        TextureSource,
      ]) => (
        <LinearRGB tonemap="aces" gain={1} samples={1} depthStencil="depth32float-stencil8">
          <Loop>
            <Cursor cursor='move' />
            <Camera>
              <Pass lights shadows mode="deferred">
                <AmbientLight intensity={0.25} />
                <DirectionalLight position={lightData[0].position} intensity={1}   color={lightData[0].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
                <DirectionalLight position={lightData[1].position} intensity={0.5} color={lightData[1].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
                <PointLight       position={lightData[2].position} intensity={100} color={lightData[2].color} shadowMap={SHADOW_MAP_POINT} />

                <Scene>

                  <Node position={[0, -4, 0]}>
                    <PBRMaterial albedo={0x808080} roughness={0.7}>
                      <Mesh
                        mesh={planeMesh}
                        side="both"
                        shaded
                      />
                    </PBRMaterial>
                  </Node>

                  <PBRMaterial albedoMap={texture} roughness={0.5}>
                    <Instances
                      mesh={boxMesh}
                      shaded
                      render={(Instance) => (<>
                        <Instance position={[0, -3, 0]} />
                        <Instance position={[-3, -2, -2]} scale={[2, 2, 2]} />
                        <Instance position={[2, -3, 4]} rotation={[0, 30, 0]} />
                        <Instance position={[-2, -3.333, 5]} scale={[2/3, 2/3, 2/3]} rotation={[0, -50, 0]} />
                      </>)}
                    />
                    <Instances
                      mesh={sphereMesh}
                      shaded
                      render={(Instance) => (<>
                        <Instance position={[8.5, -1.5, 1.2]} scale={[0.31, 0.31, 0.31]} />
                        <Instance position={[8.5, -1, 2.2]} scale={[0.31, 0.31, 0.31]} />
                        <Instance position={[7.5, 1.5, .2]} scale={[0.31, 0.31, 0.31]} />

                        <Instance position={[8, 0, 2.8]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[7, 0, 3.1]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[6, 0, 2.9]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[5, 0, 1.2]} scale={[1, 1, 1]} />

                        <Instance position={[-3, 0, 2.1]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[-4, 0, 1.9]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[-5, 0, 2.2]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[-6, 0, 1.8]} scale={[0.5, 0.5, 0.5]} />
                        <Instance position={[-7, 0, 2]} scale={[0.5, 0.5, 0.5]} />
                      </>)}
                    />
                  </PBRMaterial>
              
                </Scene>

                <Data
                  fields={lightFields}
                  data={lightData}
                  render={(positions: StorageSource, colors: StorageSource) => (
                    <PointLayer positions={positions} colors={colors} size={50} depth={0.5} mode="transparent" />
                  )}
                />

              </Pass>
            </Camera>
          </Loop>
        </LinearRGB>
      )}
    />
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={9}
    bearing={-1.8}
    pitch={0.4}
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
