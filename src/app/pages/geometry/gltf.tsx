import type { LC, PropsWithChildren } from '../../../live';
import type { TextureSource } from '../../../core';
import type { GLTF } from '../../../gltf';

import React, { Gather } from '../../../live';
import { vec3 } from 'gl-matrix';

import {
  LinearRGB, Pass, LoadingSpinner,
  OrbitCamera,
  PrefilteredEnvMap, Environment,
  PointLight,
  Animate, Suspense,
} from '../../../workbench';
import {
  Cursor,
  OrbitControls,
} from '../../../interact';

import { GLTFData, GLTFModel } from '../../../gltf';
import { Scene, Node } from '../../../scene';

import { EnvMapControls } from '../../ui/envmap-controls';
import { InfoBox } from '../../ui/info-box';

const SHADOW_MAP_POINT = {
  size: [2048, 2048],
  depth: [0.1, 50],
  bias: [1/128, 1/64, 1/16],
  blur: 4,
};

export const GeometryGLTFPage: LC = () => {

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Load a .glb model using the GLTF package. Supports PBR materials.</InfoBox>
    <EnvMapControls hasModel hasTonemap container={root} render={({tonemap, preset, map, model, position, scale}) => (
      <Gather
        children={[
          <Gather
            children={<Suspense>{map}</Suspense>}
            then={([texture]: TextureSource[]) => (
              <PrefilteredEnvMap
                texture={texture}
              />
            )}
          />
        ]}
        then={([cubeMap]: TextureSource[]) => (
          <LinearRGB tonemap={tonemap} gain={3}>
            <Cursor cursor='move' />
            <Camera>
              <Pass lights shadows ssao={1}>
                <Animate
                  loop
                  delay={0}
                  keyframes={[
                    [0, [6, 4, 2]],
                    [4, [4, 2, 10]],
                    [8, [-1, 4, 4]],
                    [12, [6, 4, 2]],
                  ]}
                  prop='position'
                >
                  <PointLight position={[10, 20, 30]} color={[0.5, 0.1, 0.25]} intensity={100} shadowMap={SHADOW_MAP_POINT} debug />
                </Animate>

                <Animate
                  loop
                  delay={0}
                  keyframes={[
                    [0, [-2, 4, -6]],
                    [3, [-4, 3, -4]],
                    [6, [-8, 3, -2]],
                    [9, [-2, 4, -6]],
                  ]}
                  prop='position'
                >
                  <PointLight position={[10, 20, 30]} color={[0.15, 0.5, 1.0]} intensity={100} shadowMap={SHADOW_MAP_POINT} debug />
                </Animate>

                <Environment map={cubeMap} preset={preset} gain={0.65}>
                  <Scene>
                    <Node position={position} scale={scale}>
                      <GLTFData url={model} fallback={<LoadingSpinner />}>{
                        (gltf: GLTF) => <GLTFModel gltf={gltf} />
                      }</GLTFData>
                    </Node>
                  </Scene>
                </Environment>
              </Pass>
            </Camera>
          </LinearRGB>
        )}
      />
    )}/>
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
        scale={1080}
      >
        {children}
      </OrbitCamera>
    }
  />
);
