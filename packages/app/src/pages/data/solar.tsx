import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit, GPUAttributes } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React from '@use-gpu/live';

import {
  Pass, LinearRGB,
  OrbitControls, OrbitCamera, FlatCamera,
  Cursor, Clock, Fetch,
  Data, ValueShader, PointLayer,
} from '@use-gpu/workbench';
import {
  Plot, Line, Point, Label, Tensor, Transform,
} from '@use-gpu/plot';
import {
  UI, Layout, Absolute, Flex, Inline, Text,
} from '@use-gpu/layout';
import { vec3 } from 'gl-matrix';

import { getBodies, getPeriod, getDayNumber, emitOrbitPosition } from './solar-system/solar-model';
import { bv2rgb } from './solar-system/bv2rgb.wgsl';

import { InfoBox } from '../../ui/info-box';
import { SolarSystemControls, SolarSystemOptions } from '../../ui/solar-system-controls';

const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

const π = Math.PI;
const WHITE = [1, 1, 1, 1];

// Equatorial to Ecliptic
const ε = 23.4392794444 * π / 180;
const cε = Math.cos(ε);
const sε = Math.sin(ε);

// Orbital bodies
const bodies = getBodies();
const labels = bodies.map(b => b.label);

// Bright star catalog
const BRIGHT_STAR_CATALOG_URL = base + 'data/bsc.json';

type BSC = {
  ra: number,
  dec: number,
  bv: number,
  vmag: number,
};

const bscSchema = {
  positions: 'vec4<f32>',
  colors: 'vec4<f32>',
};

const makeBSCGetters = (data: BSC[]) => ({
  positions: (i: number) => {
    // Right Ascenscion / Declination
    const {ra, dec} = data[i];

    const ca = Math.cos(ra);
    const sa = Math.sin(ra);
    const cd = Math.cos(dec);
    const sd = Math.sin(dec);

    // Equatorial
    const x1 = ca * cd;
    const y1 = sa * cd;
    const z1 = sd;

    // Ecliptic
    const x2 = 1e5 * (x1);
    const y2 = 1e5 * (y1 * cε - z1 * sε);
    const z2 = 1e5 * (y1 * sε + z1 * cε);

    return [x2, y2, z2, 1];
  },
  colors: (i: number) => {
    // Use BV + VMag as RG color and adapt in a shader.
    const {bv, vmag} = data[i];
    return [bv || 0, vmag, 0, 1];
  },
});

export const DataSolarSystemPage: LC = () => {

  const view = (options: SolarSystemOptions) => (<>
    <InfoBox>Draw a reactive solar system and stars, with various plot components driven by a clock.</InfoBox>
    <Cursor cursor="move" />
      <LinearRGB tonemap="aces">
        <Camera>
          <Pass>

            <Plot>
              <Transform rotation={[-90, 0, 0]}>
                <Stars />

                <Clock
                  prop="timestamp"
                  speed={options.speed}
                  paused={options.paused}
                >
                  <SolarModel />
                </Clock>

              </Transform>
            </Plot>

          </Pass>
        </Camera>

        <FlatCamera>
          <Pass overlay>
            <Clock
              prop="timestamp"
              speed={options.speed}
              paused={options.paused}
            >
              <DateTimestamp speed={options.speed} />
            </Clock>
          </Pass>
        </FlatCamera>
      </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <SolarSystemControls
      container={root}
      render={view}
    />
  );
}

type SolarModelProps = {
  timestamp?: number,
};

const SolarModel: LC<SolarModelProps> = (props: SolarModelProps) => {
  const {timestamp = 0} = props;
  const dayNumber = getDayNumber(timestamp);

  // The solar model is generated as two tensors:
  // - orbital paths - rendered as Line
  // - current positions - rendered as Label + Point

  return (<>
    <Tensor
      format='vec4<f32>'
      size={[256, bodies.length]}
      items={3}
      as={['positions', 'colors', 'widths']}
      expr={(emit: Emit, index: number, body: number) => {
        const {orbit, color: [r, g, b]} = bodies[body];

        // Day along orbit
        const i = index / 256;
        const p = getPeriod(orbit, dayNumber);
        const d = dayNumber - i * 365 * p;

        // Taper off 1 year of trail
        const v = Math.max(0, 1 - i * p);

        // Position, color, width
        emitOrbitPosition(emit, orbit(d));
        emit(r, g, b, .25 + v * .75);
        emit(3 + 6 * v);
      }}
    >
      <Line depth={0.25} />
    </Tensor>

    <Tensor
      format='vec4<f32>'
      length={bodies.length}
      items={2}
      as={['positions', 'colors']}
      expr={(emit: Emit, body: number) => {
        const {orbit, color: [r, g, b]} = bodies[body];

        // Position, color
        emitOrbitPosition(emit, orbit(dayNumber));
        emit(r, g, b, 1);
      }}
    >
      <Point size={20} depth={0.5} zBias={2} />
      <Label labels={labels} placement={'bottom'} offset={36} size={24} depth={.1} zBias={10} expand={5} color={'#000000'} colors={undefined} />
      <Label labels={labels} placement={'bottom'} offset={36} size={24} depth={.1} zBias={10} />
    </Tensor>
  </>);
};

const Stars: LC = () => {
  // The star catalog is rendered directly as a PointLayer, bypassing the plot API,
  // as it's static.
  return (
    <Fetch url={BRIGHT_STAR_CATALOG_URL} type="json">{
      (data: BSC[]) => (
        <Data
          count={data.length}
          schema={bscSchema}
          virtual={makeBSCGetters(data)}
        >{(sources: GPUAttributes) =>
          // Use a shader to recolor BV + visual magnitude into RGB.
          <ValueShader shader={bv2rgb} source={sources.colors}>{
            (colors: ShaderSource) => (
              <PointLayer {...sources} colors={colors} size={2} />
            )
          }</ValueShader>
        }
        </Data>
      )
    }</Fetch>
  );
};

type DateTimestampProps = {
  timestamp?: number,
  speed: number,
};

const DateTimestamp: LC<DateTimestampProps> = (props: DateTimestampProps) => {
  const {timestamp = 0, speed} = props;

  const d = new Date(timestamp * 1000);

  const pad2 = (s: string | number) => ('00' + s).slice(-2);

  const date = [d.getFullYear(), pad2(d.getMonth() + 1), pad2(d.getDate())].join('/');
  const time = (Math.abs(speed) < 60 * 60 * 24) ? [pad2(d.getHours()), pad2(d.getMinutes())].join(':') : null;

  const label = time ? `${date} – ${time}` : date;

  return (
    <UI>
      <Layout>
        <Absolute left={0} bottom={100} right={0}>
          <Flex align="center" width="100%">
            <Inline><Text color={WHITE} size={24}>{label}</Text></Inline>
          </Flex>
        </Absolute>
      </Layout>
    </UI>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={6}
    bearing={0.5}
    pitch={0.3}
    minRadius={3e-1}
    maxRadius={1e2}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        scale={1440}
        far={1e6}
      >
        {children}
      </OrbitCamera>
    }
  />
);
