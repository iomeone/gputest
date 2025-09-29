import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { DataField } from '@use-gpu/core';

import React, { use } from '@use-gpu/live';

import { PickingOverlay } from '../../ui/picking-overlay';
import earcut from 'earcut';

import {
  Pass, Flat,
  Cursor, Pick, Raw,
  CompositeData, LineSegments, FaceSegments,
  OrbitCamera, OrbitControls,
  LineLayer, FaceLayer,
} from '@use-gpu/workbench';

// Convex and concave polygon data

const convexDataFields = [
  // Accessor syntax
  ['array<vec3<f32>>', (o: any) => o.positions],
  // Shorthand => o.color
  ['vec3<f32>', 'color'],
] as DataField[];

const concaveDataFields = [
  ['array<vec3<f32>>', (o: any) => o.positions],
  ['vec3<f32>', 'color'],
  // Indexed attribute - must be adjusted when aggregated.
  ['array<u32>', (o: any) => o.indices, 'index'],
  ['u32', 'lookup'],
] as DataField[];

const lineDataFields = [
  ['array<vec4<f32>>', (o: any) => o],
] as DataField[];

// Generate some random polygons

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const randomColor = () => [Math.random(), Math.random(), Math.random()];
const randomInt = (min: number, max: number) => min + Math.round(Math.random() * (max - min));
const randomFloat = (min: number, max: number) => min + Math.random() * (max - min);

const circleX = (a: number, r: number) => Math.cos(a * Math.PI * 2) * r;
const circleY = (a: number, r: number) => Math.sin(a * Math.PI * 2) * r;

const N = 32;

let convexFaceData = seq(20).map(i => {
  const n = Math.max(3, randomInt(5, 16) - randomInt(0, 5));
  const r = randomFloat(0.15, 0.5);
  const o = [randomFloat(-2, 2), randomFloat(-1, 1), randomFloat(-2, -0.5)];
  return {
    positions: seq(n).map(j => [
      o[0] + circleX(j / n, r) * circleX(i / 20, 1),
      o[1] + circleY(j / n, r),
      o[2] + circleX(j / n, r) * circleY(i / 20, 1),
    ]),
    color: randomColor(),
  };
});

let concaveFaceData = seq(20).map(i => {
  const n = Math.max(3, randomInt(5, 24) - randomInt(0, 5));
  const r = randomFloat(0.15, 0.5);
  const o = [randomFloat(-2, 2), randomFloat(-1, 1), randomFloat(0.5, 2)];

  const positions = seq(n).map(j => {
    const spikes = randomInt(3, 10);
    const modulate = (1 + circleX(j / n * spikes, 1) * .5);
    return [
      o[0] + circleX(j / n, r * modulate) * circleX(i / 20, 1),
      o[1] + circleY(j / n, r * modulate),
      o[2] + circleX(j / n, r * modulate) * circleY(i / 20, 1),
    ];
  });

  const flatPos3D = positions.flatMap(p => p.slice(0, 3));
  const indices = earcut(flatPos3D, [], 3);

  return {
    positions,
    indices,
    color: randomColor(),
    lookup: i,
  };
});

let lineData = seq(22).map((i) => (
  // path: [[x, y, z, w], ...]
  i < 11 ? seq(2).map(j => [i / 2.5 - 2, -1, j * 4 - 2, 1]) : seq(2).map(j => [j * 4 - 2, -1, (i - 11) / 2.5 - 2, 1])
));

export const GeometryFacesPage: LC = () => {

  // Render polygons
  const view = (<>
    <Camera>
      <Pass picking>

        <CompositeData
          fields={convexDataFields}
          data={convexFaceData}
          on={<FaceSegments />}
          render={(positions, colors, segments, lookups) =>
            <Pick
              onMouseOver={(mouse, index) => console.log('round', {mouse, index})}
              render={({id, hovered, index}) => [
                hovered ? <Cursor cursor='default' /> : null,
                <FaceLayer
                  id={id}
                  positions={positions}
                  segments={segments}
                  colors={colors}
                  lookups={lookups}
                  side="both"
                />,
                hovered ? (
                  <CompositeData
                    fields={convexDataFields}
                    data={convexFaceData.slice(index, index + 1)}
                    on={<FaceSegments />}
                    render={(positions, colors, segments) =>
                      <FaceLayer
                        positions={positions}
                        segments={segments}
                        color={[1, 1, 1, 1]}
                        side="both"
                        zBias={1}
                      />
                    }
                  />
                ) : null
              ]}
            />
          }
        />

        <CompositeData
          fields={concaveDataFields}
          data={concaveFaceData}
          render={(positions, colors, indices, lookups) =>
            <Pick
              onMouseOver={(mouse, index) => console.log('spiky', {mouse, index})}
              render={({id, hovered, index}) => [
                hovered ? <Cursor cursor='default' /> : null,
                <FaceLayer
                  id={id}
                  positions={positions}
                  indices={indices}
                  colors={colors}
                  lookups={lookups}
                  side="both"
                />,
                hovered ? (
                  <CompositeData
                    fields={concaveDataFields}
                    data={concaveFaceData.slice(index, index + 1)}
                    render={(positions, colors, indices) =>
                      <FaceLayer
                        positions={positions}
                        indices={indices}
                        color={[1, 1, 1, 1]}
                        side="both"
                        zBias={1}
                      />
                    }
                  />
                ) : null
              ]}
            />
          }
        />

        <CompositeData
          fields={lineDataFields}
          data={lineData}
          on={<LineSegments />}
          render={(positions, segments) =>
            <LineLayer
              positions={positions}
              color={[1, 1, 1, .2]}
              width={3}
              segments={segments}
              depth={0.5}
              mode="transparent"
            />
          }
        />
      </Pass>
    </Camera>

    <Flat>
      <Pass overlay>
        <PickingOverlay />
      </Pass>
    </Flat>
  </>);

  return [
    <Cursor cursor='move' />,
    view,
  ];
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={3}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
      >
        {children}
      </OrbitCamera>
    }
  />
);
