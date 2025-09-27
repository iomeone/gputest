import { LC } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';
import { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Draw, Pass,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
} from '@use-gpu/components';

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const vecSteps = [
  vec3.fromValues(1, 0, 0),
  vec3.fromValues(-1, 0, 0),
  vec3.fromValues(0, 1, 0),
  vec3.fromValues(0, -1, 0),
  vec3.fromValues(0, 0, 1),
  vec3.fromValues(0, 0, -1),
];

const lineData1 = seq(10).map((i) => ({
  path: seq(30).reduce((arr, i) => {
    let last = arr[arr.length - 1] ?? vec3.create();
    let dir = Math.floor(Math.random() * 6);
    let next = vec3.clone(vecSteps[dir]);
    vec3.add(next, next, last);
    arr.push([next[0], next[1], next[2], 1.0]);
    return arr;
  }, []),
  color: [Math.random()*Math.random(), Math.random(), Math.random(), 1], 
  width: Math.random() * 20 + 1,
  loop: false,
}));

const lineData2 = seq(10).map((i) => {
  const path = seq(7).reduce((arr, i) => {
    let last = arr[arr.length - 1] ?? vec3.create(Math.round(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3));
    let dir = Math.floor(Math.random() * 6);
    let next = vec3.clone(vecSteps[dir]);
    vec3.add(next, next, last);
    arr.push([next[0], next[1], next[2], 1.0]);
    return arr;
  }, []);
  
  while (true) {
    let last = path[path.length - 1];
    let first = path[0];
    if (last[0] > first[0]) {
      path.push([last[0] - 1, last[1], last[2], 1.0]);
    }
    else if (last[0] < first[0]) {
      path.push([last[0] + 1, last[1], last[2], 1.0]);
    }
    else if (last[1] > first[1]) {
      path.push([last[0], last[1] - 1, last[2], 1.0]);
    }
    else if (last[1] < first[1]) {
      path.push([last[0], last[1] + 1, last[2], 1.0]);
    }
    else if (last[2] > first[2]) {
      path.push([last[0], last[1], last[2] - 1, 1.0]);
    }
    else if (last[2] < first[2]) {
      path.push([last[0], last[1], last[2] + 1, 1.0]);
    }
    else break;
  }

  path.pop();

  return {
    path,
    color: [Math.random()*Math.random(), Math.random(), Math.random(), 1], 
    width: Math.random() * 20 + 1,
    loop: true,
  };
});

const isLoop = (o: any) => o.loop;

const lineData = [...lineData1, ...lineData2];

const lineDataFields = [
  ['array<vec4<f32>>', (o: any) => o.path],
  ['vec4<f32>', 'color'],
  ['f32', 'width'],
] as DataField[];

let t = 0;

export const GeometryDataPage: LC = () => {

  const view = (
    <Loop>
      <Draw live>
        {
          use(Raw, () => {
            t = t + 1/60;
          })
        }
        <Cursor cursor='move' />
        <Pass>

          <Data
            fields={[
              ['vec4<f32>', [-5, -2.5, 0, 1, 5, -2.5, 0, 1, 0, -2.5, -5, 1, 0, -2.5, 5, 1]],
              ['i32', [1, 2, 1, 2]],
            ]}
            render={([positions, segments]) =>
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
            loop={isLoop}
            on={<LineSegments />}
            render={([positions, colors, widths, segments]: StorageSource[]) =>
              <LineLayer
                positions={positions}
                colors={colors}
                widths={widths}
                segments={segments}
                join='round'
                depth={0.9}
              />
            }
          />

          <RawData
            format='vec4<f32>'
            length={100}
            live
            expr={(emit: Emitter, i: number) => {
              const s = ((i*i + i) % 13133.371) % 1000;
              emit(
                Math.cos(t * 1.31 + Math.sin((t + s) * 0.31) + s) * 2,
                Math.sin(t * 1.113 + Math.sin((t - s) * 0.414) - s) * 2,
                Math.cos(t * 0.981 + Math.cos((t + s*s) * 0.515) + s*s) * 2,
                1,
              );
            }}
            render={(positions) =>
              <PointLayer
                positions={positions}
                colors={positions}
                shape='diamondOutlined'
                size={20}
                depth={1}
                mode={RenderPassMode.Transparent}
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
