import type { LC, PropsWithChildren } from '@use-gpu/live';

import React, { use } from '@use-gpu/live';
import { seq, lerp } from '@use-gpu/core';
import { vec3 } from 'gl-matrix';

import { PickingOverlay } from '../../ui/picking-overlay';

import {
  Pass, Cursor, Pick, PickState, FlatCamera,
  OrbitCamera, OrbitControls,
} from '@use-gpu/workbench';

import { Plot, Grid, Polygon } from '@use-gpu/plot';
import { InfoBox } from '../../ui/info-box';

// Generate some random polygons

const randomColor = () => [Math.random(), Math.random(), Math.random()*Math.random()];
const randomInt = (min: number, max: number) => min + Math.round(Math.random() * (max - min));
const randomFloat = (min: number, max: number) => min + Math.random() * (max - min);

const circleX = (a: number, r: number) => Math.cos(a * Math.PI * 2) * r;
const circleY = (a: number, r: number) => Math.sin(a * Math.PI * 2) * r;

const N = 32;

const GRID = { divide: 16, base: 2, end: true };

const roundPolygons = seq(20).map(i => {
  const n = Math.max(3, randomInt(5, 16) - randomInt(0, 5));
  const r = randomFloat(0.15, 0.5);
  const o = [randomFloat(-2, 2), randomFloat(-1, 1), randomFloat(-2, -0.5)];

  const positions = seq(n).map(j => [
    o[0] + circleX(j / n, r) * circleX(i / 20, 1),
    o[1] + circleY(j / n, r),
    o[2] + circleX(j / n, r) * circleY(i / 20, 1),
  ]);

  return {
    positions,
    color: randomColor(),
    lookup: i,
  };
});

const spikyPolygons = seq(20).map(i => {
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

  return {
    positions,
    color: randomColor(),
    lookup: i,
  };
});

export const PlotPickingPage: LC = () => {

  const view = (<>
    <InfoBox>Use &lt;Pick&gt; for GPU-driven mouse picking on any shape or layer. Attach any u32 lookup index per shape or vertex.</InfoBox>
    <Camera>
      <Pass picking>

        <Plot>
          <Grid axes="zx" width={3} color="#ffffff40" range={[[-5, 5], [-5, 5]]} origin={[0, -3, 0]} />
          
          <Pick
            onMouseOver={(mouse, index) => console.log('Round shape #' + index, mouse)}
          >{
            ({id, hovered, index}: PickState) => [
              hovered ? <Cursor cursor="default" /> : null,
              roundPolygons.map((props, i) => (
                <Polygon
                  key={i}
                  id={id}
                  {...props}
                  fill={hovered && (index === i) ? '#ffffff' : props.color}
                  stroke="#ffffff"
                  width={3}
                  depth={0.5}
                  zBiasStroke={1}
                />
              )),
            ]
          }</Pick>

          <Pick
            onMouseOver={(mouse, index) => console.log('Spiky shape #' + index, mouse)}
          >{
            ({id, hovered, index}: PickState) => [
              hovered ? <Cursor cursor="default" /> : null,
              spikyPolygons.map((props, i) => (
                <Polygon
                  key={i}
                  id={id}
                  {...props}
                  fill={hovered && (index === i) ? '#ffffff' : props.color}
                  stroke="#ffffff"
                  width={3}
                  depth={0.5}
                  zBiasStroke={1}
                />
              )),
            ]
          }</Pick>
        </Plot>

      </Pass>
    </Camera>

    <FlatCamera>
      <Pass overlay>
        <PickingOverlay />
      </Pass>
    </FlatCamera>
  </>);

  return [
    <Cursor cursor='move' />,
    view,
  ];
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={6}
    bearing={0.5}
    pitch={0.3}
  >{
    (radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
      >
        {children}
      </OrbitCamera>
  }</OrbitControls>
);
