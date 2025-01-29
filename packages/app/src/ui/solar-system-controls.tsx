import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

const STYLE = {
  position: 'absolute',

  left: 0,
  bottom: 0,
  width: '350px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type SolarSystemControlsProps = {
  container?: Element | null,
  render?: (options: SolarSystemOptions) => LiveElement
};

export type SolarSystemOptions = {
  speed: number,
  paused: boolean,
};

const STOPS = [
  {label: 'second', value: 1},
  {label: 'minute', value: 60},
  {label: 'hour', value: 60 * 60},
  {label: 'day', value: 60 * 60 * 24},
  {label: 'week', value: 60 * 60 * 24 * 7},
  {label: 'month', value: 60 * 60 * 24 * 31},
  {label: 'year', value: 60 * 60 * 24 * 365},
];

const LOG_RANGE = Math.log10(60 * 60 * 24 * 365 / 60 / 60 * 10 + 1);

const toSignedLog = (x: number) => {
  const s = Math.sign(x);
  const v = Math.abs(x) / 60 / 60;
  return s * Math.log10(v) / LOG_RANGE;
};

const fromSignedLog = (x: number) => {
  x *= LOG_RANGE;

  const s = Math.sign(x);
  const v = Math.abs(x);
  return s * Math.pow(10, v) * 60 * 60;
};

export const SolarSystemControls: LC<SolarSystemControlsProps> = (props: SolarSystemControlsProps) => {
  const {container, render} = props;

  const [speed, setSpeed] = useState(60 * 60 * 24 * 7);
  const [paused, setPaused] = useState(false);

  const matchingStop = STOPS.filter(s => Math.abs(speed) >= s.value).at(-1);

  const stop = matchingStop ?? STOPS[0];
  const unit = stop.label;
  const value = (speed / stop.value).toFixed(1).replace(/\.?0+$/, '');

  return fragment([
    render ? render({speed, paused}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div>
          <div style={{display: 'flex', alignItems: 'center', height: 30, gap: 10}}>
            <label>Speed</label>
            <input
              type="range"
              min="-1" max={1}
              value={toSignedLog(speed)}
              step={0.0001}
              onChange={(e) => setSpeed(fromSignedLog(parseFloat(e.target.value)))} style={{width: '150px'}}
            />
            <span>{value} {unit} / s</span>
          </div>
          <div><label><input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)}  /> Pause</label></div>
        </div>
      </>)
    }),
  ]);
}
