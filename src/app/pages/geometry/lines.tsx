import { LC } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';
import { use } from '@use-gpu/live';

import {
  Draw, Pass,
  Cursor,
  CompositeData, LineSegments, ArrowSegments,
  OrbitCamera, OrbitControls,
  LineLayer, ArrowLayer,
} from '@use-gpu/components';

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const randomColor = () => [Math.random(), Math.random(), Math.random(), 1];

const circleX = (a: number, r: number) => Math.cos(a * Math.PI * 2) * r;
const circleY = (a: number, r: number) => Math.sin(a * Math.PI * 2) * r;

const N = 32;

let lineData = seq(9).map((i) => ({
  path: (
    (i < 5) ? seq(10).map(j => [i / 5 - 1, j / 11 - 1, 0, 1]) :
    seq(N).map(j => [.25 + (i%2)*.5 + circleX(j/N, .15), (i - 5) / 5 - 1 + circleY(j/N, .15), 0, 1])
  ),
  color: randomColor(),
  width: Math.random() * 30 + 5,
  loop: i >= 5,
}));

let zigzagData = [{
  path: seq(24).map(i => [i / 14 - 1 - .2, -.1, ((i % 2) - .5) * .1, 1]),
  color: randomColor(),
  width: 10,
}];

let arrowData = seq(9).map((i) => ({
  path: (
    (i < 5) ? seq(10).map(j => [i / 5 - 1, j / 11, 0, 1]) :
    seq(N).map(j => [.25 + (i%2)*.5 + circleX(j/N, .15), (i - 5) / 5 + circleY(j/N, .15), 0, 1])
  ),
  color: randomColor(),
  width: Math.random() * (i >= 5 ? 3 : 30) + 5,
  loop: i >= 5,
  start: !(i % 2),
  end: !(i % 3) || i === 7,
}))

const isLoop = (o: any) => o.loop;
const isStart = (o: any) => o.start;
const isEnd = (o: any) => o.end;

const dataFields = [
  ['array<vec4<f32>>', (o: any) => o.path],
  ['vec4<f32>', 'color'],
  ['f32', 'width'],
] as DataField[];

export const GeometryLinesPage: LC = () => {

  const view = (
    <Draw>
      <Pass>
        <CompositeData
          fields={dataFields}
          data={lineData}
          loop={isLoop}
          on={<LineSegments />}
          render={([positions, colors, widths, segments]: StorageSource[]) =>
            <LineLayer
              positions={positions}
              colors={colors}
              widths={widths}
              segments={segments}
              depth={0.5}
            />
          }
        />

        <CompositeData
          fields={dataFields}
          data={zigzagData}
          on={use(LineSegments)}
          render={([positions, colors, widths, segments]: StorageSource[]) =>
            <LineLayer
              positions={positions}
              colors={colors}
              widths={widths}
              segments={segments}
              depth={0.5}
              join='round'
            />
          }
        />

        <CompositeData
          fields={dataFields}
          data={arrowData}
          loop={isLoop}
          start={isStart}
          end={isEnd}
          on={<ArrowSegments />}
          render={([positions, colors, widths, segments, anchors, trims]: StorageSource[]) =>
            <ArrowLayer
              positions={positions}
              colors={colors}
              widths={widths}
              segments={segments}
              anchors={anchors}
              trims={trims}
              depth={0.5}
            />
          }
        />
      </Pass>
    </Draw>
  );

  return [
    <OrbitControls
      radius={3}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
          scale={2160}
        >
          {view}
        </OrbitCamera>
      }
    />,
    <Cursor cursor='move' />
  ];
};
