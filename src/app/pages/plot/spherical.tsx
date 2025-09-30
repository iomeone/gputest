import type { LC, PropsWithChildren } from '@use-gpu/live';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass,
  OrbitCamera, OrbitControls,
  Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Spherical, Axis, Grid, Label, Line, Sampler, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';

import { InfoBox } from '../../ui/info-box';

const π = Math.PI;
const τ = π * 2;
const EPS = 1e-3;

const numberFormatter = (x: number) => x.toFixed(2).replace(/\.0+$/, '');

const thetaFormatter = (θ: number) => {
  if (θ === 0) return '0';
  const num = Math.abs(θ / π);
  const denom = Math.abs(π / θ);
  return `${θ < 0 ? '-' : ''}${num > 1 + EPS ? numberFormatter(num) : ''}π${denom > 1 + EPS ? '/' + numberFormatter(denom) : ''}`;
};

export const PlotSphericalPage: LC = () => {

  return (<>
    <InfoBox>Plot curves and grids in an animated &lt;Spherical&gt; viewport.</InfoBox>
    <LinearRGB>
      <Cursor cursor="move" />
      <Camera>
        <Pass>
          <Plot>
            <Animate
              loop
              mirror
              delay={0}
              keyframes={[
                [0, 0],
                [1, 0],
                [10, 1],
                [11, 1],
              ]}
              prop='bend'
            >
              <Spherical
                range={[[-τ/2, τ/2], [-τ/4, τ/4], [0, 2]]}
                scale={[1.5, 1, 1]}
              >
                <Grid
                  axes='xy'
                  width={2}
                  first={{ detail: 32, unit: π, base: 2, divide: 8, end: true }}
                  second={{ detail: 32, unit: π, base: 2, divide: 4, end: true }}
                  depth={0.5}
                  zBias={-1}
                  origin={[0, 0, 1]}
                />

                <Axis
                  axis='x'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  depth={0.5}
                  detail={32}
                  origin={[0, 0, 1]}
                />
                <Scale
                  unit={π}
                  base={2}
                  divide={4}
                  end={true}
                  axis='x'
                  origin={[0, 0, 1]}
                >
                  <Tick
                    size={20}
                    width={5}
                    offset={[0, 1, 0]}
                    color={[0.75, 0.75, 0.75, 1]}
                    depth={0.5}
                  />
                  <Label
                    placement='bottom'
                    color='#80808080'
                    size={24}
                    offset={16}
                    expand={5}
                    depth={0.5}
                    formatter={thetaFormatter}
                  />
                  <Label
                    placement='bottom'
                    color='#ffffff'
                    size={24}
                    offset={16}
                    expand={0}
                    depth={0.5}
                    formatter={thetaFormatter}
                  />
                </Scale>

                <Axis
                  axis='y'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  detail={32}
                  depth={0.5}
                  origin={[0, 0, 1]}
                />

                <Sampler
                  axes='x'
                  format='vec3<f32>'
                  size={[256]}
                  expr={(emit, θ) => {
                    const r = Math.cos(θ * 8);
                    emit(θ, r, 1);
                  }}
                >
                  <Line
                    width={4}
                    color={'#3090FF'}
                    depth={0.5}
                    zBias={1}
                  />
                </Sampler>
              </Spherical>
            </Animate>
          </Plot>
        </Pass>
      </Camera>
    </LinearRGB>
  </>);
}

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
