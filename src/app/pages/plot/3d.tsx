import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit, Time } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { use } from '@use-gpu/live';

import {
  Pass,
  OrbitControls, OrbitCamera,
  Cursor, Animate,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Axis, Grid, Point, Line, Tensor, Transform,
} from '@use-gpu/plot';
import { vec3 } from 'gl-matrix';
import { seq } from '@use-gpu/core';

import { InfoBox } from '../../ui/info-box';

let t = 0;

const BACKGROUND = [0, 0, 0.09, 1];

const KEYFRAMES = [
  [ 0, 0],
  [10, 360],
] as Keyframe[];

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

// Make 20 paths of 30 steps
const PATHS = 20;
const STEPS = 30;

const paths: number[][][] = seq(PATHS).map((i) => seq(STEPS).reduce((arr, i) => {
  let last = arr[arr.length - 1] ?? vec3.create();
  let dir = Math.floor(Math.random() * 6);

  let next = vec3.clone(vecSteps[dir]);
  vec3.add(next, next, last as any);
  arr.push([next[0], next[1], next[2]]);
  return arr;
}, [] as number[][]));

// Random color and width
const color = seq(20).map(_ => [Math.sqrt(Math.random()), Math.random()*.75, Math.sqrt(Math.random()*.25)]);
const width = seq(20).map(_ => Math.random() * 20 + 5);

// Avoid z-fighting
const zBias = width.map(w => w / 100);

export const Plot3DPage: LC = () => {

  return (<>
    <InfoBox>Draw 3D shapes using the plot API. Feed them live data via expressions. Control depth scaling smoothly.</InfoBox>
    <Cursor cursor="move" />
    <Camera>
      <Pass>
        <Plot>

          <Line
            positions={paths}
            color={color}
            width={width}
            zBias={zBias}
            depth={0.75}
          />

        </Plot>

        <Plot>
          <Transform scale={4}>
            <Tensor
              format='vec3<f32>'
              length={500}
              live
              time
              items={2}
              as={['positions', 'colors']}
              expr={(emit: Emit, i: number, time: Time) => {
                const s = ((i*i + i) % 13133.371) % 1000;
                const t = time.elapsed / 8000;

                const x = Math.cos(t * 1.31 + Math.sin((t + s) * 0.31) + s) * 2;
                const y = Math.sin(t * 1.113 + Math.sin((t - s) * 0.414) - s) * 2;
                const z = Math.cos(t * 0.981 + Math.cos((t + s*s) * 0.515) + s*s) * 2;

                const r = 1;
                const g = (1 - x - y) / 2;
                const b = (1 - z) / 2;

                emit(x, y, z);
                emit(r, g, b);
              }}
            >
              <Point shape='diamond' hollow size={50} depth={1} mode={'transparent'} />
            </Tensor>
          </Transform>
        </Plot>

      </Pass>
    </Camera>
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
        scale={2160}
      >
        {children}
      </OrbitCamera>
    }
  />
);
