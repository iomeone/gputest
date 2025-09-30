import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, StorageSource, TextureSource } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { Gather, memo, useOne } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass, FlatCamera, Animate, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
  PointLight, AmbientLight,

  makeBoxGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';

const COLOR_ON = [1, 1, 1, 1];
const COLOR_OFF = [0.5, 0.5, 0.5, 1.0];

const KEYFRAMES = [
  [ 0, [-3,  0, 0]],
  [10, [ 0, -3, 0]],
  [20, [ 3,  0, 0]],
  [30, [ 0,  3, 0]],
  [40, [-3,  0, 0]],
] as Keyframe[];

type PickableMeshProps = {
  mesh: GPUGeometry,
  texture: TextureSource,
};

const PickableMesh = memo(({mesh, texture}: PickableMeshProps) => {
  return (
    <Pick
      render={({id, hovered, presses}) =>
        <PBRMaterial albedoMap={texture} albedo={presses.left % 2 ? COLOR_ON : COLOR_OFF}>
          <Mesh
            id={id}
            mesh={mesh}
            shaded
          />
          {hovered ? <Cursor cursor='pointer' /> : null}
        </PBRMaterial>
      }
    />
  );
}, 'PickableMesh');

// This uses a typical scene-graph arrangement with an image texture
export const SceneBasicPage: LC = (props) => {
  const geometry = useOne(() => makeBoxGeometry({ width: 2 }));

  return (<>
    <InfoBox>Classic &lt;Scene&gt; tree with animated transform &lt;Node&gt; and clickable &lt;Mesh&gt;</InfoBox>
    <Gather
      children={[
        <GeometryData {...geometry} />,
        <ImageTexture url="/textures/test.png" colorSpace="srgb" />,
      ]}
      then={([
        mesh,
        texture,
      ]: [
        GPUGeometry,
        TextureSource,
      ]) => (
        <LinearRGB tonemap="aces">
          <Cursor cursor='move' />
          <Camera>
            <Pass picking lights>
              <AmbientLight intensity={0.2} />
              <PointLight position={[-2.5, 3, 2, 1]} intensity={32} />

              <Scene>

                <Animate prop="position" keyframes={KEYFRAMES} loop>
                  <Node rotation={[30, - 30, -30]}>
                    <PickableMesh mesh={mesh} texture={texture} />
                  </Node>
                </Animate>

                <Animate prop="position" keyframes={KEYFRAMES} loop delay={-20}>
                  <Node rotation={[30, - 30, -30]}>
                    <PickableMesh mesh={mesh} texture={texture} />
                  </Node>
                </Animate>

              </Scene>

            </Pass>
          </Camera>
        </LinearRGB>
      )}
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
