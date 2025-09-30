import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { GLTF } from '@use-gpu/gltf';

import React, { use, Gather } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  LinearRGB, Pass, Fetch,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
  ImageCubeTexture, PrefilteredEnvMap, Environment,
  DirectionalLight, PointLight, DomeLight,
  Animate, Suspense,
} from '@use-gpu/workbench';

import { GLTFData, GLTFModel } from '@use-gpu/gltf';
import { Scene, Node } from '@use-gpu/scene';

import { EnvMapControls } from '../../ui/envmap-controls';
import { InfoBox } from '../../ui/info-box';

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

export const GeometryGLTFPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "gltf/DamagedHelmet/DamagedHelmet.gltf";

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Load a .glb model using the GLTF package. Supports PBR materials.</InfoBox>
    <EnvMapControls container={root} render={(envPreset, envMap) => (
      <Gather
        children={[
          <Gather
            children={<Suspense>{envMap}</Suspense>}
            then={([texture]: TextureSource[]) => (
              <PrefilteredEnvMap
                texture={texture}
              />
            )}
          />
        ]}
        then={([cubeMap]: TextureSource[]) => (
          <LinearRGB>
            <Cursor cursor='move' />
            <Camera>
              <Pass lights>
                <Animate
                  loop
                  delay={0}
                  keyframes={[
                    [0, [30, 20, 10]],
                    [4, [20, 10, 40]],
                    [8, [-5, 20, 20]],
                    [12, [30, 20, 10]],
                  ]}
                  prop='position'
                >
                  <PointLight position={[10, 20, 30]} color={[0.5, 0.0, 0.25]} intensity={40*40} />
                </Animate>

                <Animate
                  loop
                  delay={0}
                  keyframes={[
                    [0, [10, 20, 30]],
                    [3, [20, 30, 10]],
                    [6, [40, 10, 20]],
                    [9, [10, 20, 40]],
                  ]}
                  prop='position'
                >
                  <PointLight position={[10, 20, 30]} color={[1, 0.5, 0.25]} />
                </Animate>

                <DirectionalLight position={[-30, -10, 10]} color={[0, 0.5, 1.0]} />
                <DomeLight intensity={0.15} />

                <Environment map={cubeMap} preset={envPreset}>
                  <Scene>
                    <Node position={[0, -0.1, 0]}>
                      <GLTFData url={url}>{
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
