import React from 'react';
import { use } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

const ICON = (s: string) => <span className="m-icon">{s}</span>

const STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  padding: '10px',
  background: 'rgba(0, 0, 0, .75)',

  zIndex: 100,
};

type InfoBoxProps = {
  children: any,
};

export const InfoBox = ({children}: InfoBoxProps) => {
  const root = document.querySelector('#use-gpu .canvas')!;
  return (
    <HTML 
      container={root}
      style={STYLE}
    >
      {children}
    </HTML>
  );
}
