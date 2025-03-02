import React from 'react';
import { use } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

const ICON = (s: string) => <span className="m-icon">{s}</span>

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

  const style = {...STYLE};
  if (right != null) { style.right = right } else { style.left = left || 0 };
  if (bottom != null) { style.bottom = bottom } else { style.top = top || 0 };

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
