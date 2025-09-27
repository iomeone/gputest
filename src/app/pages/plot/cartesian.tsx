import type { LC } from '@use-gpu/live';

import React, { use } from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  ArrayData, Data, RawData,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Axis, Grid, Label, Line, Sampled, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';

let t = 0;

export const PlotCartesianPage: LC = () => {
  
  const view = (
    <Loop>
      <LinearRGB>
        <Cursor cursor="move" />
        <Pass>
          <Plot>
            <Animate
              loop
              mirror
              delay={0}
              keyframes={[
                [0, [[-3, 0], [0, 1], [0, 3]]],
                [10, [[0, 3], [0, 1], [0, 3]]],
              ]}
              prop='range'
            >
              <Cartesian
                scale={[2, 1, 1]}
              >
                <Grid
                  axes='xy'
                  width={2}
                  first={{ detail: 3, divide: 5 }}
                  second={{ detail: 3, divide: 5 }}
                  depth={0.5}
                  zBias={-1}
                />
                <Grid
                  axes='xz'
                  width={2}
                  first={{ detail: 3, divide: 5 }}
                  second={{ detail: 3, divide: 5 }}
                  depth={0.5}
                  zBias={-1}
                />

                <Axis
                  axis='x'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  depth={0.5}
                />
                <Scale
                  divide={5}
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
                  />
                  <Label
                    placement='bottom'
                    color='#ffffff'
                    size={24}
                    offset={16}
                    expand={0}
                    depth={0.5}
                  />
                </Scale>

                <Axis
                  axis='y'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  detail={8}
                  depth={0.5}
                />
                <Axis
                  axis='z'
                  width={5}
                  color={[0.75, 0.75, 0.75, 1]}
                  detail={8}
                  depth={0.5}
                />
                <Sampled
                  axes='zx'
                  format='vec4<f32>'
                  size={[10, 20]}
                  expr={(emit, z, x) => {
                    const v = Math.cos(x) * Math.cos(z);
                    emit(x, v * .4 + .5, z, 1);
                  }}
                >
                  <Surface
                    color={[0.1, 0.3, 1, 1]}
                  />
                  <Line
                    width={2}
                    color={[0.5, 0.5, 1, 0.5]}
                    depth={0.5}
                    zBias={1}
                  />
                  <Transpose axes='yx'>
                    <Line
                      width={2}
                      color={[0.5, 0.5, 1, 0.5]}
                      depth={0.5}
                      zBias={1}
                    />
                  </Transpose>
                </Sampled>
              </Cartesian>
            </Animate>
          </Plot>
        </Pass>
      </LinearRGB>
    </Loop>
  );

  return (
    <OrbitControls
      radius={5}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
        >
          {view}
        </OrbitCamera>
      }
    />
  );
};
