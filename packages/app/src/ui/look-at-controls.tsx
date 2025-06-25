import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

const STYLE = {
  position: 'absolute',

  left: 0,
  //left: '50%',
  //marginLeft: '-100px',

  bottom: 0,
  width: '400px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

const POSITIONS = [
  [1, 2, 3],
  [-3, 3, -3],
  [0, 2, 4],
  [-.1, 1, -4],
];

const TARGETS = [
  [0, 0, 0],
  [3, -1, 3],
  [0, -1, 0],
  [0, 0, 0],
];

export type LookAtControlsProps = {
  container?: Element | null,
  children?: (options: LookAtOptions) => LiveElement
};

export type LookAtOptions = {
  position: VectorLike,
  target: VectorLike,
};

export const LookAtControls: LC<LookAtControlsProps> = (props: LookAtControlsProps) => {
  const {container, children} = props;

  const [index, setIndex] = useState(0);
  const position = POSITIONS[index];
  const target = TARGETS[index];

  const prev = () => setIndex((index - 1 + POSITIONS.length) % POSITIONS.length);
  const next = () => setIndex((index + 1) % POSITIONS.length);

  return fragment([
    children ? children({position, target}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{display: 'flex', alignItems: 'center', height: 30}}>
            <label style={{width: 120}}>Viewpoint</label>
            <button onClick={prev}>&lt; Prev</button>
            <button onClick={next}>Next &gt;</button>
          </div>
        </div>
      </>)
    }),
  ]);
}
