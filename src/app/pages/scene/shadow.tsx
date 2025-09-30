import type { LC, PropsWithChildren } from '../../../live';
import type { GPUGeometry, TextureSource } from '../../../core';

import React, { Gather } from '../../../live';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB, Loop,
  GeometryData, PBRMaterial, ImageTexture,
  OrbitCamera, Environment,
  DirectionalLight, PointLight, AmbientLight, SpotLight,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';
import {
  Scene, Node, Mesh, Instances,
} from '../../../scene';

import { InfoBox } from '../../ui/info-box';

const SHADOW_MAP_DIRECTIONAL = {
  size: [2048, 2048],
  span: [50, 50],
  depth: [0, 100],
  bias: [1/4096, 1/512, 0],
  blur: 4,
};

const SHADOW_MAP_POINT = {
  size: [2048, 2048],
  depth: [0.1, 50],
  bias: [1/128, 1/64, 1/16],
  blur: 4,
};

const SHADOW_MAP_SPOT = {
  size: [2048, 2048],
  depth: [0.1, 70],
  bias: [1/64, 1/32, 1/16],
  blur: 4,
};

const sampler = {
  addressModeU: 'repeat',
  addressModeV: 'repeat',
} as GPUSamplerDescriptor;

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

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
  {
    position: [5, 20, -3, 1],
    direction: [-0.307, -1, 0.307, 1],
    color: [0.85, 0.65, 0.2, 1],
    fov: 120,
    feather: 5,
    cutoff: 0.001,
  },
  {
    position: [-5, 30, 3, 1],
    direction: [0.307, -1, -0.307, 1],
    color: [0.2, 0.85, 0.65, 1],
    fov: 30,
    feather: 5,
    cutoff: 0.001,
  },
];

export const SceneShadowPage: LC = () => {

  return (<>
    <InfoBox>&lt;DirectionalLight&gt;, &lt;PointLight&gt; and &lt;SpotLight&gt; with shadow map (forward renderer)</InfoBox>
    <Gather
      children={[
        <GeometryData {...boxGeometry} />,
        <GeometryData {...planeGeometry} />,
        <GeometryData {...sphereGeometry} />,
        <ImageTexture url="/textures/test.png" sampler={sampler} />,
      ]}
      then={([
        boxMesh,
        planeMesh,
        sphereMesh,
        texture,
      ]: [
        GPUGeometry,
        GPUGeometry,
        GPUGeometry,
        TextureSource,
      ]) => (
        <LinearRGB tonemap="aces" gain={1}>
          <Cursor cursor='move' />
          <Camera>
            <Loop converge={64}>
              <Pass lights shadows ssao={2}>
                <AmbientLight intensity={0.2} />

                <DirectionalLight {...lightData[0]} intensity={1}   shadowMap={SHADOW_MAP_DIRECTIONAL} debug />
                <DirectionalLight {...lightData[1]} intensity={0.5} shadowMap={SHADOW_MAP_DIRECTIONAL} debug />
                <PointLight       {...lightData[2]} intensity={100} shadowMap={SHADOW_MAP_POINT} debug />
                <SpotLight        {...lightData[3]} intensity={600} shadowMap={SHADOW_MAP_SPOT} debug />
                <SpotLight        {...lightData[4]} intensity={600} shadowMap={SHADOW_MAP_SPOT} debug />

                <Environment preset="none">
                  <Scene>

                    <PBRMaterial albedo={'#808080'} roughness={0.7}>
                      <Node position={[0, -4, 0]}>
                        <Mesh
                          mesh={planeMesh}
                          side="both"
                          shaded
                        />
                      </Node>
                    </PBRMaterial>

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
                </Environment>

              </Pass>
            </Loop>
          </Camera>
        </LinearRGB>
      )}
    />
  </>);
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
