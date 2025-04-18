import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit, Time } from '@use-gpu/core';

import React from '@use-gpu/live';

import {
  LinearRGB, Loop, Pass,
  OrbitControls, OrbitCamera,
  Cursor,
  DirectionalLight, PointLight, AmbientLight,
  PBRMaterial, EaseToTarget,
  GeometryData, makeSphereGeometry,
} from '@use-gpu/workbench';
import {
  Plot, Arrow, Transform, Tensor,
} from '@use-gpu/plot';
import {
  Mesh,
} from '@use-gpu/scene';
import { vec3 } from 'gl-matrix';
import { seq } from '@use-gpu/core';

import { InfoBox } from '../../ui/info-box';

// Make 80 paths of 60 steps
const PATHS = 80;
const STEPS = 120;

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
  return [Math.max(0, 2*b - r*r), g - r * .1 - g * .2, r + g * .2];
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
    <InfoBox>Applying shading and materials to 3D lines and arrows, tesselated using vertex shaders.</InfoBox>
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

              <AmbientLight intensity={0.3} />
              <DirectionalLight position={lightData[0].position} intensity={0.6} color={lightData[0].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
              <DirectionalLight position={lightData[1].position} intensity={0.6} color={lightData[1].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />
              <PointLight       position={lightData[2].position} intensity={50}  color={lightData[2].color} shadowMap={SHADOW_MAP_POINT} />

              <PBRMaterial>
                <Tensor
                  format='vec3<f32>'
                  size={[STEPS, PATHS]}
                  live
                  time
                  as={'positions'}
                  expr={(emit: Emit, i: number, j: number, time: Time) => {
                    const r = (1 + j / PATHS) * .7;
                    const t = time.elapsed;

                    const pz = ((j + .5) / PATHS) * 6.28;
                    const tz = (((i + .5) / STEPS) * 2 - 1) * 3.1415;

                    const phi1 = pz + Math.sin(pz + tz + t * .000661);
                    const th1 = tz + Math.cos(tz * .519 - pz*pz*.1 + t * .000113) * .56;

                    const phi2 = phi1 + Math.sin(phi1 + tz + Math.cos(2 * pz - th1 + t * .000349) + t * .000259);
                    const th2 = th1 + Math.cos(th1 * .419 - phi1*phi1*.1 + t * .000277) * .53;

                    const phi = phi2;
                    const th = th2 + t * .001;

                    const ct = Math.cos(th);
                    const st = Math.sin(th);

                    const cp = Math.cos(phi);
                    const sp = Math.sin(phi);

                    const x = ct * cp * r;
                    const y = st * cp * r;
                    const z = sp * r;

                    emit(x, y, z + tz);
                  }}
                >
                  <Arrow
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
                </Tensor>
              </PBRMaterial>

              <PBRMaterial albedo={GRAY}>
                <Arrow
                  positions={squarePath}
                  color={[1,1,1,1]}
                  zBias={zBias}

                  // use absolute 3D sizing so shadow maps can work
                  width={0.1}
                  depth={-1}

                  sides={5}
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

const Camera = ({children}: PropsWithChildren<object>) => {
  const view = <OrbitCamera>{children}</OrbitCamera>;

  return (
    <OrbitControls
      radius={5}
      bearing={-1}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number, target: vec3) =>
        <EaseToTarget
          values={{
            radius,
            phi,
            theta,
            target,
          }}
        >
          {view}
        </EaseToTarget>
      }
    />
  );
};
