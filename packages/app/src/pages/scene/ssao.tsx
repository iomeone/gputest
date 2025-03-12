import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, StorageSource, TextureSource, UniformType } from '@use-gpu/core';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';
import { seq } from '@use-gpu/core';

import {
  Loop, Pass, FlatCamera, Animate, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture,
  OrbitCamera, OrbitControls, Environment, FPSControls,
  Cursor,
  DirectionalLight, PointLight, AmbientLight,
  Data, PointLayer,
  DebugProvider, PrintLayer, PrintHelper,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh, Instances,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';
import { SSAOControls } from '../../ui/ssao-controls';

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

const sampler = {
  addressModeU: 'repeat',
  addressModeV: 'repeat',
} as GPUSamplerDescriptor;

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

const rnd = () => Math.random() * 2.0 - 1.0;

const cubes = seq(30).map(i => {
  const s = Math.random() + .5;
  return {
    position: [rnd() * 12, -2 + s, rnd() * 12],
    rotation: [0, Math.random() * 360, 0],
    scale: [s, s, s],
  };
});

const spheres = seq(30).map(i => {
  const s = Math.random() + .5;
  return {
    position: [rnd() * 12, -2 + s, rnd() * 12],
    rotation: [0, Math.random() * 360, 0],
    scale: [s, s, s],
  };
});

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

export const SceneSSAOPage: LC = (props) => {

  const view = (showAO: boolean) => (
    <DebugProvider
      debug={{
        ssao: { showAO, pickAO: true },
      }}
    >
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
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>
              <Loop live decimate={60}>
              <PrintHelper count={4096}>
                <Pass lights ssao={2} overscan={16} debug="ssao">

                  <Environment preset="pisa" gain={2}>
                    <Scene>

                      <Node position={[0, -2.001, 0]}>
                        <PBRMaterial albedo={'#808080'} roughness={0.7}>
                          <Mesh
                            mesh={planeMesh}
                            side="both"
                            shaded
                          />
                        </PBRMaterial>
                      </Node>

                      <PBRMaterial xalbedoMap={texture} roughness={0.5}>
                        <Instances mesh={boxMesh} shaded>
                          {(Instance) => cubes.map((cube) => <Instance {...cube} />)}
                        </Instances>
                        <Instances mesh={sphereMesh} shaded>
                          {(Instance) => spheres.map((sphere) => <Instance {...sphere} />)}
                        </Instances>
                      </PBRMaterial>

                    </Scene>
                  </Environment>

                  <PrintLayer size={6} width={3} />

                </Pass>
              </PrintHelper>
              </Loop>
            </Camera>
          </LinearRGB>
        )}
      />
    </DebugProvider>
  );

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Screen-space ambient occlusion with built-in &lt;SSAOPass&gt;</InfoBox>
    <SSAOControls
      container={root}
      render={({showAO}) =>
        view(showAO)
      }
    />
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <FPSControls
    position={[0, 2, 0]}
    bearing={0.1}
    pitch={0.3}
    moveSpeed={2}
  >{
    (phi: number, theta: number, target: vec3) => (
      <OrbitCamera
        radius={0}
        phi={phi}
        theta={theta}
        target={target}
        scale={1080}
      >
        {children}
      </OrbitCamera>
    )
  }</FPSControls>
);

const XCamera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={9}
    bearing={-1.8}
    pitch={0.6}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        near={0.1}
        target={target}
      >
        {children}
      </OrbitCamera>
    }
  />
);
