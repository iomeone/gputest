import { LiveFiber } from '@use-gpu/live/types';
import { formatNode, formatValue } from '@use-gpu/live';
import styled, { keyframes } from "styled-components";

import React, { Fragment, useState } from 'react';
import { Action } from './types';
import { SplitRow, IndentTree, Label } from './layout';

import { inspectObject } from './props';

const StyledShader = styled.div`
  background: rgba(255, 255, 255, 0.1);
  font-family: "Fira Code", "Bitstream Vera Mono", monospace;
  font-size: 12px;
  line-height: 13px;
`

const StyledEditor = styled.div`
  display: flex;
  padding: 10px 0;
`

const StyledGutter = styled.div`
  padding: 0 5px;
  border-right: 1px solid var(--borderThin);
  text-align: right;
  color: var(--colorTextMuted);
  font-size: 0.9em;
`

const StyledCode = styled.div`
  flex-grow: 1;
  white-space: pre;
  padding: 0 10px;
  overflow: auto;
`

type ShaderProps = {
	shader: string,
};

export const Shader: React.FC<ShaderProps> = ({shader}) => {

	return (<>
    <div><b>Shader</b></div>
    <StyledShader>
  		{inspectCode(shader)}
  	</StyledShader>
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