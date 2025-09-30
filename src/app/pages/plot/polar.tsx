import type { LC } from '@use-gpu/live';

import React, { use } from '@use-gpu/live';

import {
  Loop, Pass, FlatCamera,
  Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Polar, Axis, Grid, Label, Line, Sampler, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';

import { InfoBox } from '../../ui/info-box';

const π = Math.PI;
const EPS = 1e-3;

const numberFormatter = (x: number) => x.toFixed(2).replace(/\.0+$/, '');

const thetaFormatter = (θ: number) => {
  if (θ === 0) return '0';
  const num = Math.abs(θ / π);
  const denom = Math.abs(π / θ);
  return `${θ < 0 ? '-' : ''}${num > 1 + EPS ? numberFormatter(num) : ''}π${denom > 1 + EPS ? '/' + numberFormatter(denom) : ''}`;
};

export const PlotPolarPage: LC = () => {

  return (<>
    <InfoBox>Plot curves and grids in an animated &lt;Polar&gt; viewport.</InfoBox>
    <LinearRGB>
      <FlatCamera relative>
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
              <Polar
                on="x"
                range={[[-π, π], [0, 1]]}
                scale={[1, 1/2, 1/2]}
              >
                <Grid
                  axes='xy'
                  width={2}
                  first={{ unit: π, base: 2, divide: 8, end: true }}
                  second={{ detail: 64, divide: 5 }}
                  depth={0.5}
                  zBias={-1}
                />

                <Axis
                  axis='x'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  depth={0.5}
                  detail={64}
                />
                <Scale
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
                    blend="alpha"
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
                  detail={8}
                  depth={0.5}
                  end
                />

                <Sampler
                  axes='x'
                  format='vec2<f32>'
                  size={[512]}
                  expr={(emit, θ) => {
                    const r = Math.cos(θ * 8) * .4 + .6;
                    emit(θ, r);
                  }}
                >
                  <Line
                    width={4}
                    color={'#3090FF'}
                    depth={0.5}
                    zBias={1}
                  />
                </Sampler>
              </Polar>
            </Animate>
          </Plot>
        </Pass>
      </FlatCamera>
    </LinearRGB>
  </>);
};
