import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit } from '@use-gpu/core';

import React from '@use-gpu/live';

import {
  Pass, LinearRGB,
  OrbitCamera, FlatCamera,
  Clock,
} from '@use-gpu/workbench';
import {
  Cursor, OrbitControls,
} from '@use-gpu/interact';
import {
  Plot, Line, Point, Label, Tensor, Transform,
} from '@use-gpu/plot';
import {
  UI, Layout, Absolute, Flex, Inline, Text,
} from '@use-gpu/layout';
import { vec3 } from 'gl-matrix';

import { getBodies, getPeriod, getDayNumber, emitOrbitPosition } from './solar-system/solar-model';

import { InfoBox } from '../../ui/info-box';
import { SolarSystemControls, SolarSystemOptions } from '../../ui/solar-system-controls';
import { Stars } from './solar-system/bsc';

const WHITE = [1, 1, 1, 1];

// Orbital bodies
const bodies = getBodies();
const labels = bodies.map(b => b.label);

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
      <Label labels={labels} placement='bottom' offset={[0, 12]} size={24} depth={.1} zBias={10} expand={3} detail={24} color={'#000000'} colors={undefined} />
      <Label labels={labels} placement='bottom' offset={[0, 12]} size={24} depth={.1} zBias={10} />
    </Tensor>
  </>);
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
