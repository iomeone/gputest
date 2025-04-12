import type { LC, PropsWithChildren } from '@use-gpu/live';

import React from '@use-gpu/live';

import {
  LinearRGB, Loop, Pass,
  OrbitControls, OrbitCamera,
  Cursor,
  DirectionalLight, PointLight, AmbientLight,
  PBRMaterial,
  GeometryData, makeSphereGeometry,
} from '@use-gpu/workbench';
import {
  Plot, Arrow, Transform,
} from '@use-gpu/plot';
import {
  Mesh,
} from '@use-gpu/scene';
import { vec3 } from 'gl-matrix';
import { seq } from '@use-gpu/core';

import { InfoBox } from '../../ui/info-box';

// Generate a line voxel grid

// Take random +/- X/Y/Z steps
const vecSteps = [
  vec3.fromValues(1, 0, 0),
  vec3.fromValues(-1, 0, 0),
  vec3.fromValues(0, 1, 0),
  vec3.fromValues(0, -1, 0),
  vec3.fromValues(0, 0, 1),
  vec3.fromValues(0, 0, -1),
];

// Make 80 paths of 60 steps
const PATHS = 80;
const STEPS = 60;

const paths: number[][][] = seq(PATHS).map((j) => seq(STEPS).map((i) => {

  const r = (1 + j / PATHS) / 2;
  const phi = ((j + .5) / PATHS) * 6.28;
  const th = (((i + .5) / STEPS) * 2 - 1) * 3.1415;

  const ct = Math.cos(th);
  const st = Math.sin(th);

  const cp = Math.cos(phi);
  const sp = Math.sin(phi);

  const x = ct * cp * r;
  const y = st * cp * r;
  const z = sp * r;

  return [x, y, z + th];
}, [] as number[][]));

const squarePath = [
  [-2,  2, 0],
  [-2, -2, 0],
  [ 2, -2, 0],
  [ 2, -2,-3],
];

// Random color and width
const color = seq(PATHS).map(() => {
  const r = 0.5 + Math.random() * 0.5;
  const g = 0.25 + Math.random() * 0.5;
  const b = 0.15 + Math.random() * 0.5;
  return [b, g + r * .1 - b * .2, r + g * .2];
});
const width = seq(PATHS).map(() => (Math.random() * 20 + 5) / 100);

// Avoid z-fighting
const zBias = width.map(w => w / 100);

// Light setup
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

const lightData = [
  {
    position: [-10, 20, 15, 1],
    color: [1, 1, 1, 1],
  },
  {
    position: [-15, -20, -5, 1],
    color: [0.8, 0.4, 0.8, 1],
  },
  {
    position: [2, 4.5, 2.5, 1],
    color: [0.3, 0.8, 1.0, 1],
  },
];

const sphereGeometry = makeSphereGeometry({ width: 0.5 });

const GRAY = [0.25, 0.25, 0.25, 1.0];

export const PlotTubesPage: LC = () => {

  return (<>
    <InfoBox>Applying shading and materials to 3D lines and arrows, generated using vertex shaders.</InfoBox>
    <Cursor cursor="move" />
    <LinearRGB>
      <Camera>
        <Loop converge={32}>
          <Pass lights shadows ssao overscan={0.05}>
            <Plot>

              <Transform position={[0, -2, 0]}>
                <PBRMaterial albedo={GRAY}>
                  <GeometryData {...sphereGeometry}>
                    {mesh => <Mesh mesh={mesh} shaded shadow />}
                  </GeometryData>
                </PBRMaterial>
              </Transform>

              <AmbientLight intensity={0.2} />
              <DirectionalLight position={lightData[0].position} intensity={0.7} color={lightData[0].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
              <DirectionalLight position={lightData[1].position} intensity={0.7} color={lightData[1].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
              <PointLight       position={lightData[2].position} intensity={50}  color={lightData[2].color} shadowMap={SHADOW_MAP_POINT} />

              <PBRMaterial>
                <Arrow
                  positions={paths}
                  color={color}
                  zBias={zBias}
                  size={1}

                  // use absolute 3D sizing so shadow maps can work
                  width={0.05}
                  depth={-1}

                  sides={3}
                  shaded
                  shadow
                  start
                  end
                  join="tangent"
                />
              </PBRMaterial>

              <PBRMaterial albedo={GRAY}>
                <Arrow
                  positions={squarePath}
                  color={[1,1,1,1]}
                  zBias={zBias}

                  // use absolute 3D sizing so shadow maps can work
                  width={0.1}
                  depth={-1}

                  sides={3}
                  shadow
                  shaded
                  start
                  end
                  join="round"
                />
              </PBRMaterial>

            </Plot>
          </Pass>
        </Loop>
      </Camera>
    </LinearRGB>
  </>);
}

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={6}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        fov={0.5}
      >
        {children}
      </OrbitCamera>
    }
  />
);
