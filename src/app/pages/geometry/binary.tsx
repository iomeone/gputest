import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { DataField, StorageSource } from '@use-gpu/core';

import React, { Gather, yeet, use, useMemo } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, Flat,
  ArrayData, Data, DataShader, RawData,
  OrbitCamera, OrbitControls,
  Pick, Cursor, Fetch,
  PointLayer,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Axis, Grid, Label, Line, Sampled, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';
import { BinaryControls } from '../../ui/binary-controls';
import { vec3 } from 'gl-matrix';

let t = 0;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const RANGE = [[0, 256], [0, 256], [0, 256]];
const GRID = { divide: 16, base: 2, end: true };

// Turn binary buffer into XYZ points for consecutive byte triplets.
const arrayBufferToXYZ = (buffer: ArrayBuffer) => {
  const data = new Uint8Array(buffer);
  const l = data.length;

  // Allocate space for positions and counts
  const n = Math.max(4, l - 2);
  const alloc = Math.max(4, Math.min(256 * 256 * 256 * 4, n * 4));
  const positions = new Uint8Array(alloc);
  const counts = new Uint32Array(alloc);

  // Build 3D histogram of triplets
  const histo = new Uint32Array(256 * 256 * 256);
  for (let i = 0; i < n; ++i) {
    const x = data[i];
    const y = data[i + 1];
    const z = data[i + 2];
    const k = (z << 16) | (y << 8) | x;

    const v = histo[k] = histo[k] + 1;
  }

  // Make data points for non-empty bins
  const h = histo.length;


  let min = Infinity;
  let max = 0;

  // Determine average of 32 highest bins
  let best = 0;
  const accum = Array.from({ length: 32 }).map(_ => 0);
  for (let k = 0; k < h; ++k) if (histo[k]) {
    const v = histo[k];
    min = Math.min(min, v);
    max = Math.max(max, v);
    if (v > best) {
      const i = accum.findIndex(x => x < v);
      if (i >= 0) {
        accum.pop();
        accum.splice(i, 0, v);
      }
      best = accum[accum.length - 1];
    }
  }
  const level = (accum.reduce((a, b) => a + b, 0) / accum.length) || 1;

  // Emit data for non-empty bins
  let bins = 0;
  for (let k = 0, p = 0, c = 0; k < h; ++k) if (histo[k]) {
    const x = k & 0xFF;
    const y = (k >>> 8) & 0xFF;
    const z = (k >>> 16) & 0xFF;

    positions[p++] = x;
    positions[p++] = y;
    positions[p++] = z;
    positions[p++] = 1;

    counts[c++] = histo[k];

    bins++;
  }
  
  if (min == max) min--;

  return {
    level,
    range: [min, max],
    count: bins,
    fields: [
      ['vec4<u8>', positions],
      ['u32', counts],
    ] as DataField[],
  };
};

// uint8 -> f32 conversion for positions
// Could just use a Float32Array but we're feeling frugal.
// Because u8 doesn't exist in WGSL, vec4<u8> arrives as a vec4<u32> after polyfilling
const positionShader = wgsl`
  @link fn getData(i: u32) -> vec4<u32>;

  fn main(i: u32) -> vec4<f32> {
    let position = getData(i);
    return vec4<f32>(position) + vec4<f32>(0.5, 0.5, 0.5, 0.0);
  }
`;

// Colorization shader
const colorShader = wgsl`
  @link fn getMode() -> u32;
  @link fn getTransparent() -> u32;
  @link fn getRange() -> vec2<f32>;
  @link fn getLevel() -> f32;

  @link fn getPosition(i: u32) -> vec4<u32>;
  @link fn getCount(i: u32) -> u32;

  fn remap(f: f32, min: f32, max: f32) -> f32 {
    return (f - min) / (max - min);
  }

  fn main(i: u32) -> vec4<f32> {
    let mode = getMode();
    let transparent = getTransparent();

    let range = getRange();
    let level = getLevel();
    let count = f32(getCount(i));

    let normalized = remap(count, 0.0, range.y);
    let leveled = count / level;
    let t = (4.0 + log(leveled) / log(10.0));

    var color: vec4<f32>;
    if (mode == 1) {
      // Histogram
      let r = sin(t * 4.0) * .5 + .5;
      let g = sin(t * 4.0 + 2.09) * .5 + .5;
      let b = sin(t * 4.0 + 4.18) * .5 + .5;

      let tint = vec3<f32>(r, g, b);      
      let luma = max(0.0, t);
      color = vec4<f32>(luma * tint, 1.0);
    }
    if (mode == 2) {
      // XYZ
      let pos = getPosition(i);
      let tint = mix(vec3<f32>(pos.xyz) / 255.0, vec3<f32>(1.0), 0.25);
      let luma = max(0.0, t);

      color = vec4<f32>(luma * tint, 1.0);
    }
    if (transparent > 0) {
      return color * 0.5;
    }
    return color;
  }
`;

export const GeometryBinaryPage: LC = () => {

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <BinaryControls
      container={root}
      render={({mode, buffer, gamma, transparent}) => {
        const data = useMemo(() => buffer ? arrayBufferToXYZ(buffer) : null, [buffer]);

        const viz = useMemo(() => data ? (
          <Data
            fields={data.fields}
            render={(positions, counts) => (
              <Gather
                children={[
                  <DataShader
                    shader={positionShader}
                    source={positions}
                  />,
                  <DataShader
                    shader={colorShader}
                    sources={[positions, counts]}
                    args={[mode, transparent, data.range, data.level]}
                  />,
                ]}
                then={([positions, colors]: StorageSource[]) => (
                  <PointLayer
                    count={data.count}
                    positions={positions}
                    colors={colors}
                    size={3}
                    depth={1}
                    mode={transparent ? "transparent" : "opaque"}
                    blend={transparent ? "add" : "none"}
                    depthWrite={!transparent}
                  />
                )}
              />
            )}
          />
        ) : null, [data, mode, transparent]);

        const view = useMemo(() => (
          <Camera>
            <Pass>
              <Plot>
                <Cartesian
                  range={RANGE}
                >
                  {viz}
                  <Grid
                    color="#202020"
                    axes='xy'
                    width={2}
                    first={GRID}
                    second={GRID}
                    depth={0.5}
                    zBias={-5}
                    auto
                  />
                  <Grid
                    color="#202020"
                    axes='xz'
                    width={2}
                    first={GRID}
                    second={GRID}
                    depth={0.5}
                    zBias={-5}
                    auto
                  />
                  <Grid
                    color="#202020"
                    axes='yz'
                    width={2}
                    first={GRID}
                    second={GRID}
                    depth={0.5}
                    zBias={-5}
                    auto
                  />
                </Cartesian>
              </Plot>
            </Pass>
          </Camera>
        ), [viz]);

        return (
          <Loop>
            <LinearRGB tonemap="aces" colorInput="linear" gain={gamma}>
              <Cursor cursor="move" />
              {view}
            </LinearRGB>
          </Loop>
        );
      }}
    />
  );
}

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
      >
        {children}
      </OrbitCamera>
    }
  />
);
