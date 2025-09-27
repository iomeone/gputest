import type { LC } from '@use-gpu/live';
import type { DataField, Emit, RenderPassMode, Time } from '@use-gpu/core';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Draw, Pass,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
} from '@use-gpu/workbench';

// Line data fields

const lineDataFields = [
  ['array<vec3<f32>>', (o: any) => o.path],
  ['vec3<f32>', 'color'],
  ['f32', 'width'],
  ['f32', 'zBias'],
] as DataField[];

// Generate a line voxel grid 

const seq = (n: number, s: number = 0, d: number = 1): number[] => Array.from({ length: n }).map((_, i: number) => s + d * i);

// Take random +/- X/Y/Z steps
const vecSteps = [
  vec3.fromValues(1, 0, 0),
  vec3.fromValues(-1, 0, 0),
  vec3.fromValues(0, 1, 0),
  vec3.fromValues(0, -1, 0),
  vec3.fromValues(0, 0, 1),
  vec3.fromValues(0, 0, -1),
];

const lineData = seq(20).map((i) => ({
  path: seq(30).reduce((arr, i) => {
    let last = arr[arr.length - 1] ?? vec3.create();
    let dir = Math.floor(Math.random() * 6);
    let next = vec3.clone(vecSteps[dir]);
    vec3.add(next, next, last as any);
    arr.push([next[0], next[1], next[2]]);
    return arr;
  }, [] as number[][]),
  color: [Math.random()*Math.random(), Math.random(), Math.random()], 
  width: Math.random() * 20 + 1,
  zBias: i / 100,
  loop: false,
}));

let t = 0;

export const GeometryDataPage: LC = () => {

  const view = (
    <Loop>
      <Draw>
        <Cursor cursor='move' />
        <Pass>

          <Data
            fields={[
              ['vec3<f32>', [-5, -2.5, 0, 5, -2.5, 0, 0, -2.5, -5, 0, -2.5, 5]],
              ['i32', [1, 2, 1, 2]],
            ]}
            render={(positions, segments) =>
              <LineLayer
                positions={positions}
                segments={segments}
                width={5}
                depth={1}
                color={[0.125, 0.25, 0.5, 1]}
              />
            }
          />

          <CompositeData
            fields={lineDataFields}
            data={lineData}
            on={<LineSegments />}
            render={(positions, colors, widths, zBiases, segments) =>
              <LineLayer
                positions={positions}
                colors={colors}
                widths={widths}
                segments={segments}
                zBiases={zBiases}
                join='round'
                depth={0.9}
              />
            }
          />

          <RawData
            format='vec3<f32>'
            length={100}
            live
            time
            expr={(emit: Emit, i: number, n: number, time: Time) => {
              const s = ((i*i + i) % 13133.371) % 1000;
              const t = time.elapsed / 1000;
              emit(
                Math.cos(t * 1.31 + Math.sin((t + s) * 0.31) + s) * 2,
                Math.sin(t * 1.113 + Math.sin((t - s) * 0.414) - s) * 2,
                Math.cos(t * 0.981 + Math.cos((t + s*s) * 0.515) + s*s) * 2,
              );
            }}
            render={(positions) =>
              <PointLayer
                positions={positions}
                colors={positions}
                shape='diamondOutlined'
                size={20}
                depth={1}
                mode={'transparent'}
              />
            }
          />
        </Pass>
      </Draw>
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
          scale={1080}
        >
          {view}
        </OrbitCamera>
      }
    />
  );
};
