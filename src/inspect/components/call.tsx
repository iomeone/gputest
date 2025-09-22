import { LiveFiber } from '../live/types';
import { useResource, formatNode, formatValue } from '../live';
import styled, { keyframes } from "styled-components";

import React from 'react';
import { Action } from './types';
import { SplitRow, IndentTree, Label } from './layout';

import { inspectObject } from './props';

const StyledCall = styled.div`
`

type CallProps = {
	fiber: LiveFiber<any>,
};

export const Call: React.FC<CallProps> = ({fiber}) => {
  // @ts-ignore
	const {id, depth, path, context, state, yeeted, next} = fiber;

	let props = {id, depth, path, state, yeeted, context, next} as Record<string, any>;

	return (<StyledCall>
		<div><b>Fiber</b></div>
		<div>{inspectObject(props)}</div>
	</StyledCall>);
}
