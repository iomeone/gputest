import type { LC } from '@use-gpu/live';
import type { Emit, StorageSource } from '@use-gpu/core';

import React, { use } from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  ArrayData, Data, RawData,
  OrbitCamera, OrbitControls,
  Pick, Cursor,
  Animate,
  LinearRGB,
  DualContourLayer, PointLayer,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Axis, Grid, Sampled,
} from '@use-gpu/plot';

let t = 0;

const EXPR_POSITION = (emit: Emit, x: number, y: number, z: number) => {
  emit(x, y, z);
}
const EXPR_VALUE = (emit: Emit, x: number, y: number, z: number) => {
  emit(Math.cos(x) * Math.cos(y) * Math.cos(z));
}

export const PlotImplicitSurfacePage: LC = () => {
  
  const view = (
    <Loop>
      <LinearRGB>
        <Cursor cursor="move" />
        <Pass>
          <Plot>
            <Cartesian
              range={[[0, 3], [0, 1], [0, 1]]}
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
                axes='xyz'
                format='vec3<f32>'
                size={[8, 8, 8]}
                expr={EXPR_POSITION}
                render={(positions: StorageSource) => (
                  <Sampled
                    axes='xyz'
                    format='f32'
                    size={[8, 8, 8]}
                    expr={EXPR_VALUE}
                    render={(values: StorageSource) => [
                      <DualContourLayer
                        values={values}
                        range={[[-3, 3], [-1, 1], [-1, 1]]}
                        color={[0.7, 0.0, 0.5, 1.0]}
                      />,
                      <PointLayer
                        positions={positions}
                        colors={values}
                        size={3}
                        depth={1}
                      />,
                    ]}
                  />
                )}
              />
            </Cartesian>
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
