import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/workbench';

import { Checkbox } from './widgets/checkbox';
import { Slider } from './widgets/slider';
import { Select } from './widgets/select';
import { Row } from './widgets/flex';

const STYLE = {
  position: 'absolute',

  left: 0,

  bottom: 0,
  width: '300px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type DrosteState = {
  func: number,
  grid: number,
  turn: number,
  invert: boolean,
  separation: number,
  symmetry: number,
  shiftX: number,
  shiftY: number,
};

type DrosteControlsProps = {
  container?: Element | null,
  children?: (state: DrosteState) => LiveElement
};

const GRID_OPTIONS = [
  {value: 0, label: 'Logarithmic'},
  {value: 1, label: 'Logarithmic Continuous'},
  {value: 2, label: 'Polar'},
  {value: 3, label: 'Polar Continuous'},
];

const FUNCTION_OPTIONS = [
  {value: 0, label: 'Escher'},
  {value: 1, label: 'Double Escher', shift: true},
  {value: 2, label: 'NPN Split', shift: true},
  {value: 3, label: 'Circle', separation: true, symmetry: true},
];

export const DrosteControls: LC<DrosteControlsProps> = (props: DrosteControlsProps) => {
  const {container, children} = props;

  const [func, setFunc] = useState(2);
  const [grid, setGrid] = useState(1);
  const [turn, setTurn] = useState(4);
  const [invert, setInvert] = useState(false);

  const [shiftX, setShiftX] = useState(0.2);
  const [shiftY, setShiftY] = useState(0.3);
  const [separation, setSeparation] = useState(0.3);
  const [symmetry, setSymmetry] = useState(8);

  const currentF = FUNCTION_OPTIONS[func];
  const hasShift = currentF.shift;
  const hasSeparation = currentF.separation;
  const hasSymmetry = currentF.symmetry;

  const isGridInvertible = grid < 2;

  return fragment([
    children ? children({func, grid, turn, invert, separation, symmetry, shiftX, shiftY}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <label>
          <Row>
            <div style={{ width: 100 }}>Function</div>
            <Select options={FUNCTION_OPTIONS} value={func} onChange={setFunc} />
          </Row>
        </label>
        <label>
          <Row>
            <div style={{ width: 100 }}>Grid</div>
            <Select options={GRID_OPTIONS} value={grid} onChange={setGrid} />
          </Row>
        </label>
        <label>
          <Row>
            <div style={{ width: 100 }}>Invert</div>
            <Checkbox disabled={!isGridInvertible} value={invert} onChange={setInvert} />
          </Row>
        </label>

        <label>
          <Row>
            <div style={{ width: 100 }}>Twist</div>
            <Slider min={-12} max={12} value={turn} step={1} onChange={setTurn} />
          </Row>
        </label>

        { hasSymmetry ? (
          <label>
            <Row>
              <div style={{ width: 100 }}>Symmetry</div>
              <Slider min={1} max={16} value={symmetry} step={1} onChange={setSymmetry} />
            </Row>
          </label>
        ) : null}

        { hasSeparation ? (
          <label>
            <Row>
              <div style={{ width: 100 }}>Separation</div>
              <Slider min={-1} max={1} value={separation} step={0.01} onChange={setSeparation} />
            </Row>
          </label>
        ) : null}

        { hasShift ? (<>
          <label>
            <Row>
              <div style={{ width: 100 }}>Real Shift</div>
              <Slider min={-1} max={1} value={shiftX} step={0.01} onChange={setShiftX} />
            </Row>
          </label>
          <label>
            <Row>
              <div style={{ width: 100 }}>Imaginary Shift</div>
              <Slider min={-1} max={1} value={shiftY} step={0.01} onChange={setShiftY} />
            </Row>
          </label>
        </>) : null }
      </>)
    }),
  ]);
}
