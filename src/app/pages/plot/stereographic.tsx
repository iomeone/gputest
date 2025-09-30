import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Keyframe } from '@use-gpu/workbench';

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
  Plot, Spherical, Stereographic, Axis, Grid, Label, Line, Sampler, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';

import { PlotControls } from '../../ui/plot-controls';
import { InfoBox } from '../../ui/info-box';

const π = Math.PI;
const τ = π*2;
const EPS = 1e-3;

const numberFormatter = (x: number) => x.toFixed(2).replace(/\.0+$/, '');

const thetaFormatter = (θ: number) => {
  if (θ === 0) return '0';
  const num = Math.abs(θ / π);
  const denom = Math.abs(π / θ);
  return `${θ < 0 ? '-' : ''}${num > 1 + EPS ? numberFormatter(num) : ''}π${denom > 1 + EPS ? '/' + numberFormatter(denom) : ''}`;
};

export const PlotStereographicPage: LC = () => {

  const frames = [
    [0, 0],
    [1, 0],
    [10, 1],
    [11, 1],
  ] as Keyframe[];

  const view = (normalize: number) => (<>
    <InfoBox>Plot curves and grids in an animated &lt;Stereographic&gt; viewport.</InfoBox>
    <LinearRGB>
    <Camera>
      <Pass>
        <Plot>
          <Animate
            loop
            mirror
            delay={0}
            keyframes={frames}
            prop='bend'
          >
            <Stereographic
              bend={0}
              normalize={normalize}
              range={[[-1, 1], [-1, 1], [-1, 1]]}
              scale={[1, 1, 1]}
            >
              <Spherical
                rotation={[45, 22.5, 0]}
                range={[[-π, π], [-τ/4, τ/4], [-1, 1]]}
              >

                <Grid
                  axes='xy'
                  origin={[0, 0, 1]}
                  width={2}
                  first={{ unit: π, base: 2, detail: 64, divide: 8, end: true }}
                  second={{ detail: 64, divide: 5 }}
                  depth={0.5}
                  zBias={-1}
                />

                <Axis
                  axis='x'
                  origin={[0, 0, 1]}
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  depth={0.5}
                  detail={64}
                />
                <Scale
                  origin={[0, 0, 1]}
                  unit={π}
                  base={2}
                  divide={4}
                  axis='x'
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
                  origin={[0, 0, 1]}
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  detail={32}
                  depth={0.5}
                />

                <Sampler
                  axes='x'
                  format='vec3<f32>'
                  size={[1024]}
                  expr={(emit, θ) => {
                    const r = Math.cos(θ * 4 + Math.sin(θ * 3) * .5) * .4 - Math.sin(θ * 5) * .5;
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

              <Spherical
                rotation={[45, 22.5, 0]}
                scale={[0.25, 0.25, 0.25]}
                range={[[-π, π], [-τ/4, τ/4], [-1, 1]]}
              >

                <Grid
                  axes='xy'
                  origin={[0, 0, 1]}
                  width={2}
                  first={{ unit: π, base: 2, detail: 64, divide: 8, end: true }}
                  second={{ detail: 64, divide: 5 }}
                  color={[0.25, 0.25, 0.25, 1]}
                  depth={0.5}
                  zBias={-1}
                />

              </Spherical>
            </Stereographic>
          </Animate>
        </Plot>
      </Pass>
    </Camera>
    </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <PlotControls
      container={root}
      hasNormalize
      render={({normalize}) =>
        view(+normalize)
      }
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
