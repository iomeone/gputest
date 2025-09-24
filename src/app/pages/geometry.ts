import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, ShaderLanguages, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { use, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  CompositeData, Data, RawData, Raw,
  OrbitCamera, OrbitControls,
  Pick, Cursor, Points, Lines,
  RawQuads as Quads, RawLines,
  RenderToTexture,
  Router, Routes,
} from '@use-gpu/components';
import { Mesh } from '../mesh';
import { makeMesh, makeTexture } from '../meshes/mesh';

export type GeometryPageProps = {
  canvas: HTMLCanvasElement,
};

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const data = seq(10).map((i) => ({
  position: [Math.random()*4-2, Math.random()*4-2, Math.random()*4-2, 1],
  size: Math.random() * 50 + 10,
}));

const quadFields = [
  ['vec4', 'position'],
  ['float', 'size'],
] as DataField[];

const lineFields = [
  ['vec4', [2, -2, 2, 1, 2, -2, -2, 1, -2, -2, -2, 1, -2, -2, 0, 1, 0, -2, 0, 1, 0, 0, 0, 1]],
  ['int', [1, 3, 3, 3, 3, 2]],
  ['float', [10, 10, 10, 10, 10]],
] as DataField[];

const lineData = seq(1).map((i) => ({
  path: seq(3 + i + Math.random() * 5).map(() => [Math.random()*2-1, Math.random()*2-1 - 2, Math.random()*2-1, 1]),
  color: [Math.random(), Math.random(), Math.random(), 1], 
  size: Math.random() * 20 + 1,
  loop: false,
}));

lineData.push({
  path: [[2, 0, 0, 1], [2, 1, 0, 1], [2, 1, 1, 1], [2, 0, 1, 1]],
  color: [0.7, 0, 0.5, 1],
  size: 20,
  loop: true,
})

const lineDataFields = [
  ['vec4[]', (o: any) => o.path],
  ['vec4', 'color'],
  ['float', 'size'],
] as DataField[];

let t = 0;
let lj = 0;
const getLineJoin = () => ['bevel', 'miter', 'round'][lj = (lj + 1) % 3];

export const GeometryPage: LiveComponent<GeometryPageProps> = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();
  const {canvas} = props;

  const view = (
    use(Draw)({
      live: true,
      children: [
        use(Raw)(() => {
          t = t + 1/60;
        }),
        use(Pass)({
          children: [
            use(Data)({
              fields: lineFields,
              render: ([positions, segments, sizes]: StorageSource[]) => [
                use(RawLines)({ positions, segments, size: 50, join: 'round' }),
                use(RawLines)({ positions, segments, size: 50, join: 'round', mode: RenderPassMode.Debug }),
                use(RawLines)({ positions, segments, size: 50, join: 'round', mode: RenderPassMode.Debug, depth: 1 }),
              ]
            }),
            use(CompositeData)({
              fields: lineDataFields,
              data: lineData,
              isLoop: (o: any) => o.loop,
              render: ([segments, positions, colors, sizes]: StorageSource[]) => [
                use(RawLines)({ segments, positions, colors, sizes, }),
              ]          
            }),
            use(RawData)({
              format: 'vec4',
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
                use(Points)({ positions, colors: positions, size: 20, depth: 1, mode: RenderPassMode.Transparent }),
                use(Points)({ positions, size: 20, depth: 1, mode: RenderPassMode.Debug }),
                use(Points)({ positions, size: 20, depth: 0, mode: RenderPassMode.Debug }),
              ],
            }),
            use(Pick)({
              render: ({id, hovered, clicked}) => [
                use(Mesh)({ texture, mesh, blink: clicked }),
                use(Mesh)({ id, texture, mesh, mode: RenderPassMode.Picking }),
                hovered ? use(Cursor)({ cursor: 'pointer' }) : null,
              ],
            }),
          ]
        }),
      ],
    })
  );

  return (
    use(OrbitControls)({
      canvas,
      render: (radius: number, phi: number, theta: number) =>

        use(OrbitCamera)({
          radius, phi, theta,
          scale: 1080,
          children: view,
        })  
    })
  );
};
