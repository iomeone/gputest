import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { use, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Draw, Pass,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
} from '@use-gpu/components';

export type GeometryPageProps = {
  canvas: HTMLCanvasElement,
};

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const quadFields = [
  ['vec4<f32>', 'position'],
  ['f32', 'widths'],
] as DataField[];

const lineFields = [
  ['vec4<f32>', [2, -2, 2, 1, 2, -2, -2, 1, -2, -2, -2, 1, -2, -2, 0, 1, 0, -2, 0, 1, 0, 0, 0, 1]],
  ['i32', [1, 3, 3, 3, 3, 2]],
  ['f32', [10, 10, 10, 10, 10]],
] as DataField[];

const lineData = seq(1).map((i) => ({
  path: seq(3 + i + Math.random() * 5).map(() => [Math.random()*2-1, Math.random()*2-1 - 2, Math.random()*2-1, 1]),
  color: [Math.random(), Math.random(), Math.random(), 1], 
  width: Math.random() * 20 + 1,
  loop: false,
}));

lineData.push({
  path: [[2, 0, 0, 1], [2, 1, 0, 1], [2, 1, 1, 1], [2, 0, 1, 1]],
  color: [0.7, 0, 0.5, 1],
  width: 20,
  loop: true,
})

const lineDataFields = [
  ['array<vec4<f32>>', (o: any) => o.path],
  ['vec4<f32>', 'color'],
  ['f32', 'width'],
] as DataField[];

let t = 0;
let lj = 0;
const getLineJoin = () => ['bevel', 'miter', 'round'][lj = (lj + 1) % 3];

export const GeometryDataPage: LiveComponent<GeometryDataPageProps> = (props) => {
  const {canvas} = props;

  const view = (
    use(Draw, {
      live: true,
      children: [
        use(Raw, () => {
          t = t + 1/60;
        }),
        use(Cursor, { cursor: 'move' }),
        use(Pass, {
          children: [
            use(Data, {
              fields: [
                ['vec4<f32>', [-5, 0, 0, 1, 5, 0, 0, 1]],
                ['i32', [1, 2]],
              ],
              render: ([positions, segments]) => use(LineLayer, { positions, segments, width: 30, depth: 1 }),
            }),
            use(Data, {
              fields: lineFields,
              render: ([positions, segments, sizes]: StorageSource[]) => [
                use(LineLayer, { positions, segments, width: 50, join: 'round' }),
              ]
            }),
            use(CompositeData, {
              fields: lineDataFields,
              data: lineData,
              loop: o => o.loop,
              on: use(LineSegments),
              render: ([positions, colors, widths, segments]: StorageSource[]) => [
                use(LineLayer, { positions, colors, widths, segments }),
              ]          
            }),
            use(RawData, {
              format: 'vec4<f32>',
              length: 100,
              live: true,
              expr: (emit: Emitter, i: number) => {
                const s = ((i*i + i) % 13133.371) % 1000;
                emit(
                  Math.cos(t * 1.31 + Math.sin((t + s) * 0.31) + s) * 2,
                  Math.sin(t * 1.113 + Math.sin((t - s) * 0.414) - s) * 2,
                  Math.cos(t * 0.981 + Math.cos((t + s*s) * 0.515) + s*s) * 2,
                  1,
                );
              },
              render: (positions) => [
                use(PointLayer, { positions, colors: positions, shape: 'diamondOutlined', size: 20, depth: 1, mode: RenderPassMode.Transparent }),
              ],
            }),
          ]
        }),
      ],
    })
  );

  return (
    use(OrbitControls, {
      canvas,
      render: (radius: number, phi: number, theta: number) =>

        use(OrbitCamera, {
          radius, phi, theta,
          scale: 1080,
          children: view,
        })  
    })
  );
};
