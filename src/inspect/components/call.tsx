import { LiveFiber } from '@use-gpu/live/types';
import { formatNode, formatValue } from '@use-gpu/live';
import styled, { keyframes } from "styled-components";

import React, { useState } from 'react';
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
	const {id, depth, path, context, state, yeeted, next, host} = fiber;

	let props = {id, depth, path, state, yeeted, context, next, host} as Record<string, any>;

	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const toggleExpanded = (id: string) => setExpanded((state) => ({
		...expanded,
		[id]: !expanded[id],
	}));

	return (
    <StyledCall>
  		<div><b>Fiber</b></div>
  		<div>{inspectObject(props, expanded, toggleExpanded, '')}</div>
  	</StyledCall>
  );
}
