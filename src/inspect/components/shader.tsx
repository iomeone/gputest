import { LiveFiber } from '@use-gpu/live/types';
import { formatNode, formatValue } from '@use-gpu/live';
import { styled } from "@stitches/react";

import React, { Fragment, useState } from 'react';
import { Action } from './types';
import { SplitRow, Label, Selectable } from './layout';

import { inspectObject } from './props';

const StyledShader = styled('div', {
  background: 'rgba(255, 255, 255, 0.1)',
  fontFamily: '"Fira Code", "Bitstream Vera Mono", monospace',
  fontSize: '12px',
  lineHeight: '13px',
});

const StyledEditor = styled('div', {
  display: 'flex',
  padding: '10px 0',
  width: '100%',
});

const StyledGutter = styled('div', {
  padding: '0 5px',
  borderRight: '1px solid var(--borderThin)',
  textAlign: 'right',
  color: 'var(--colorTextMuted)',
  fontSize: '0.9em',
});

const StyledCode = styled('div', {
  flexGrow: '1',
  whiteSpace: 'pre',
  padding: '0 10px',
  overflow: 'auto',
});

type ShaderProps = {
  shader: string,
};

export const Shader: React.FC<ShaderProps> = ({shader}) => {

  return (<>
    <div><b>Shader</b></div>
    <StyledShader><Selectable>
      {inspectCode(shader)}
    </Selectable></StyledShader>
  </>);
}

const inspectCode = (code: string) => {
  const lines = code.split("\n");

  const rows = lines.map((l, i) => <span key={i.toString()}>{l}<br /></span>);
  const indices = lines.map((_, i) => <div key={i.toString()}>{i + 1}</div>);

  const gutterWidth = Math.ceil(Math.log10(lines.length)) * 14;

  return (<StyledEditor>
    <StyledGutter style={{width: gutterWidth}}>
      {indices}
    </StyledGutter>
    <StyledCode>
      {rows}
    </StyledCode>
  </StyledEditor>)
}