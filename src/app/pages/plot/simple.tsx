import { LC } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { use } from '@use-gpu/live';
import React from '@use-gpu/live/jsx';

import {
  Loop, Draw, Pass, Flat,
  CompositeData, ArrayData, Data, RawData, Raw,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer,
  Animation,
  Plot, Cartesian, Axis, Grid, Scale, Tick, Label, Sampled,
  LinearRGB,
} from '@use-gpu/components';
import { Mesh } from '../mesh';
import { makeMesh, makeTexture } from '../meshes/mesh';

let t = 0;

export const PlotSimplePage: LC = () => {
  
  const view = (
    <Loop>
      <LinearRGB>
        {
          use(Raw, () => {
            t = t + 1/60;
          })
        }
        <Cursor cursor="move" />
        <Pass>
          <Plot>
            <Animation
              loop
              mirror
              delay={0}
              frames={[
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
                  width={3}
                  first={{ detail: 3, divide: 5 }}
                  second={{ detail: 3, divide: 5 }}
                  depth={0.5}
                />
                <Grid
                  axes='xz'
                  width={3}
                  first={{ detail: 3, divide: 5 }}
                  second={{ detail: 3, divide: 5 }}
                  depth={0.5}
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
                    size={50}
                    width={5}
                    offset={[0, 1, 0]}
                    color={[0.75, 0.75, 0.75, 1]}
                    depth={0.5}
                  />
                  <Label
                    placement='bottom'
                    color='#808080'
                    size={32}
                    offset={16}
                    expand={5}
                    depth={0.5}
                  />
                  <Label
                    placement='bottom'
                    color='#ffffff'
                    size={32}
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
                  axes='xz'
                  format='vec4<f32>'
                  size={[64, 32]}
                  expr={(emit, x, y) => {
                    const v = Math.cos(x) * Math.cos(y);
                    emit(x, v * .5 + .5, y, 1);
                  }}
                  render={(data: ShaderSource) =>
                    <PointLayer
                      positions={data}
                      size={10}
                      color={[0.2, 0.5, 1, 1]}
                      depth={0.5}
                    />
                  }
                />
              </Cartesian>
            </Animation>
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
