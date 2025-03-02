import React from 'react';
import { HTML } from '@use-gpu/react';

const STYLE = {
  position: 'absolute',
  padding: '10px',
  background: 'rgba(0, 0, 0, .75)',

  zIndex: 100,
};

type InfoBoxProps = {
  left?: number | null,
  right?: number | null,
  top?: number | null,
  bottom?: number | null,
  
  children: any,
};

export const InfoBox = ({left, top, right, bottom, children}: InfoBoxProps) => {

  const style: Record<string, any> = {...STYLE};
  if (right != null) { style.right = right } else { style.left = left || 0 };
  if (bottom != null) { style.bottom = bottom } else { style.top = top || 0 };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = document.querySelector('#use-gpu .canvas')!;

  return (
    <HTML
      container={root}
      style={style}
    >
      {children}
    </HTML>
  );
}
