import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit, Time } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { use } from '@use-gpu/live';

import {
  Pass,
  FPSControls, OrbitCamera,
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
const color = seq(20).map(_ => [Math.sqrt(Math.random()*.25), Math.random()*.75, Math.sqrt(Math.random())]);
const width = seq(20).map(_ => Math.random() * 20 + 5);

// Avoid z-fighting
const zBias = width.map(w => w / 100);

export const FPSControlsPage: LC = () => {

  return (<>
    <InfoBox>Use &lt;FPSControls&gt; with pointer lock.</InfoBox>
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

      </Pass>
    </Camera>
  </>);
}

const Camera = ({children}: PropsWithChildren<object>) => (
  <FPSControls
    position={[0.5, 0.5, 3.5]}
    bearing={0.1}
    pitch={0.1}
    moveSpeed={8}
  >{
    (phi: number, theta: number, target: vec3) => (
      <OrbitCamera
        radius={0}
        phi={phi}
        theta={theta}
        target={target}
        scale={1080}
      >
        {children}
      </OrbitCamera>
    )
  }</FPSControls>
);
