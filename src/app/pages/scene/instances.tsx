import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource, TextureSource } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, Flat, Animate, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture,
  OrbitCamera, OrbitControls,
  Cursor,
  PointLight, AmbientLight,

  makeBoxGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Instances,
} from '@use-gpu/scene';

const COLOR_ON = [1, 1, 1, 1];
const COLOR_OFF = [0.5, 0.5, 0.5, 1.0];

const POSITION_KEYFRAMES = [
  [ 0, [-3,  0, 0]],
  [10, [ 0, -3, 0]],
  [20, [ 3,  0, 0]],
  [30, [ 0,  3, 0]],
  [40, [-3,  0, 0]],
] as Keyframe<any>[];

const ROTATION_KEYFRAMES = [
  [ 0, [0,   0, 0]],
  [ 6, [0, 360, 0]],
  [ 8, [0, 360, 0]],
  [ 8, [0,   0, 0]],
  [14, [360, 0, 0]],
  [16, [360, 0, 0]],
] as Keyframe<any>[];

const seq = (n: number, s: number = 0, d: number = 1): number[] => Array.from({ length: n }).map((_, i: number) => s + d * i);

export const SceneInstancesPage: LC = (props) => {
  const geometry = useOne(() => makeBoxGeometry({ width: 2 }));

  return (
    <Gather
      children={[
        <GeometryData geometry={geometry} />,
        <ImageTexture url="/textures/test.png" />,
      ]}
      then={([
        mesh,
        texture,
      ]: [
        Record<string, StorageSource>,
        TextureSource,
      ]) => (
        <LinearRGB tonemap="aces">
          <Loop>
            <Cursor cursor='move' />
            <Camera>
              <Pass lights>
                <AmbientLight intensity={0.2} />
                <PointLight position={[-2.5, 3, 2, 1]} intensity={32} />

                <Scene>
                  <PBRMaterial
                    albedoMap={texture}
                  >
                    <Instances
                      mesh={mesh}
                      shaded
                      render={(Instance) => (<>

                        <Animate prop="rotation" keyframes={ROTATION_KEYFRAMES} loop ease="cosine">
                          <Node>
                            {seq(20).map(i => (
                              <Animate prop="position" keyframes={POSITION_KEYFRAMES} loop delay={-i * 2} ease="linear">
                                <Instance
                                  rotation={[Math.random()*360, Math.random()*360, Math.random()*360]}
                                  scale={[0.2, 0.2, 0.2]}
                                />
                              </Animate>
                            ))}
                          </Node>
                        </Animate>
                        
                        <Node rotation={[90, 90, 0]} scale={[0.7, 0.7, 0.7]}>
                          <Animate prop="rotation" keyframes={ROTATION_KEYFRAMES} loop ease="cosine">
                            <Node>
                              {seq(20).map(i => (
                                <Animate prop="position" keyframes={POSITION_KEYFRAMES} loop delay={-i * 2} ease="linear">
                                  <Instance
                                    rotation={[Math.random()*360, Math.random()*360, Math.random()*360]}
                                    scale={[0.2, 0.2, 0.2]}
                                  />
                                </Animate>
                              ))}
                            </Node>
                          </Animate>
                        </Node>

                      </>)}
                    />
                  </PBRMaterial>
              
                </Scene>
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
