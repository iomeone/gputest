import { LiveFiber } from '../live/types';
import { useResource, formatValue } from '../live';
import styled, { keyframes } from "styled-components";

import React from 'react';
import { Action } from './types';

const pingAnimation = keyframes`
 0% { background: rgba(255, 230, 0, 1); }
 100% { background: rgba(255, 230, 0, 0); }
`

const selectedAnimation = keyframes`
 0% { background: rgba(210, 190, 128, 1); }
 100% { background: rgba(210, 210, 255, 1); }
`

export const NodeNormal = styled.div`
	white-space: nowrap;
	margin: -2px -5px;
	padding: 2px 5px;
	&.selected {
		background: rgba(210, 210, 255, 1);
	}
`;

export const NodeHighlight = styled(NodeNormal)`
	animation-name: ${pingAnimation};
	animation-duration: 0.5s;
	animation-iteration-count: 1;

	&.selected {
		animation-name: ${selectedAnimation};
	}
`;

type NodeProps = {
	fiber: LiveFiber<any>,
	pinged: number,
	selected: boolean,
	onClick?: Action,
};

export const Node: React.FC<NodeProps> = ({fiber, pinged, selected, onClick}) => {
	const {id, f, args} = fiber;
	const Wrapper = pinged ? NodeHighlight : NodeNormal;
	const className = selected ? 'selected' : '';

  // @ts-ignore
  let name = (f?.displayName ?? f?.name) || 'Node';
  if (name === 'PROVIDE' && args) {
    const [context] = args;
    name = `Provide(${formatValue(context.displayName)})`;
  }
  else if (name === 'DETACH' && args) {
    const [call] = args;
    name = `Detach(${formatValue(call.f)})`;
  }

  return <Wrapper key={pinged} className={className} onClick={onClick}>{name}</Wrapper>;
}

