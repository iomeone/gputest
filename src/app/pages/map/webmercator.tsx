import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Tracks } from '@use-gpu/workbench';

import React, { use } from '@use-gpu/live';

import {
  Loop, Pass, Flat,
  RawData, PointLayer,
  Cursor, OrbitCamera, OrbitControls,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Spherical, Axis, Grid, Label, Line, Sampled, Scale, Surface, Tick, Transpose,
} from '@use-gpu/plot';
import {
  WebMercator, MVTiles, MapboxProvider, MapTileProvider,
} from '@use-gpu/map';

import { PlotControls } from '../../ui/plot-controls';

import { vec3 } from 'gl-matrix';

const π = Math.PI;
const τ = π*2;
const EPS = 1e-3;

const numberFormatter = (x: number) => x.toFixed(2).replace(/\.0+$/, '');

const thetaFormatter = (θ: number) => {
  if (θ === 0) return '0';
  const num = Math.abs(θ / π);
  const denom = Math.abs(π / θ);
  return `${θ < 0 ? '-' : ''}${num > 1 + EPS ? numberFormatter(num) : ''}π${denom > 1 + EPS ? '/' + numberFormatter(denom) : ''}`;
};

const USE_MAPBOX = false;

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

// @ts-ignore
const accessToken = process.env.MAPBOX_TOKEN;

export const MapWebMercatorPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "tiles/:zoom-:x-:y.mvt";
  
  const tracks = {
    zoom: [
      [ 0, 1],
      [10, 2],
      [20, 3],
      [30, 3],
      [40, 5],
      [50, 5],
      [60, 2],
      [70, 1],
    ],
    long: [
      [ 0, 0],
      [10, 0],
      [20, 0],
      [30, 50],
      [40, 70],
      [50, 120],
      [60, 360],
      [60, 0],
      [70, 0],
    ],
    lat: [
      [ 0, 0],
      [10, 30],
      [20, 30],
      [30, 30],
      [40, 20],
      [50, -30],
      [60, 30],
      [70, 0],
    ],
    bend: [
      [ 0, 0],
      [10, 0],
      [20, 1],
      [30, 1],
      [40, 1],
      [50, 1],
      [60, 1],
      [70, 0],
    ],
  } as Tracks;

  return (
    <Loop>
      <Cursor cursor='move' />
      <LinearRGB>
        <Camera>
          <Pass>
            <Plot>
              <Animate
                loop
                delay={1}
                speed={2}
                tracks={tracks}
                duration={75}
              >
                <WebMercator
                  bend={1}
                  range={[[-1.5, 1.5], [-.5 - 2/3, .5 + 2/3]]}
                  long={90}
                  lat={20}
                  zoom={1}
                  scale={[3, 3, 3]}
                  centered
                  scissor
                  native
                >
                  {USE_MAPBOX ? (
                    <MapboxProvider accessToken={accessToken}>
                      <MVTiles />
                    </MapboxProvider>
                  ) : (
                    <MapTileProvider url={url}>
                      <MVTiles detail={3} />
                    </MapTileProvider>
                  )}
                </WebMercator>
                <WebMercator
                  bend={1}
                  range={[[-1, 1], [-2/3, 2/3]]}
                  long={90}
                  lat={20}
                  zoom={1}
                  scale={[3, 3, 3]}
                  centered
                >
                  <Grid
                    axes='xy'
                    origin={[0, 0, 0]}
                    width={2}
                    first={{ unit: 360, base: 2, detail: 48, divide: 8, end: true }}
                    second={{ unit: 360, base: 2, detail: 48, divide: 8, end: true }}
                    color={[0.75, 0.75, 0.75, 0.125]}
                    depth={0.5}
                    zBias={10}
                  />

                  <Axis
                    axis='x'
                    width={5}
                    color={[0.75, 0.75, 0.75, 1]}
                    depth={0.5}
                    detail={64}
                  />
                  <Scale
                    unit={360}
                    base={2}
                    divide={8}
                    axis='x'
                  >
                    <Tick
                      size={20}
                      width={5}
                      offset={[0, 1, 0]}
                      color={[0.75, 0.75, 0.75, 1]}
                      depth={0.5}
                    />
                  </Scale>

                  <Axis
                    axis='y'
                    width={5}
                    origin={[45, 0, 0]}
                    color={[0.75, 0.75, 0.75, 1]}
                    detail={32}
                    depth={0.5}
                  />
                  <Scale
                    origin={[45, 0, 0]}
                    unit={360}
                    base={2}
                    divide={8}
                    axis='y'
                  >
                    <Tick
                      size={20}
                      width={5}
                      offset={[1, 0, 0]}
                      color={[0.75, 0.75, 0.75, 1]}
                      depth={0.5}
                    />
                  </Scale>
                
                </WebMercator>
              </Animate>
            </Plot>
          </Pass>
        </Camera>
      </LinearRGB>
    </Loop>
  );
};

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
        scale={1440}
      >
        {children}
      </OrbitCamera>
    }
  />
);
