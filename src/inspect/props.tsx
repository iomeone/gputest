import { LiveFiber } from '../live/types';
import { useResource, formatNode, formatValue } from '../live';
import styled, { keyframes } from "styled-components";

import React from 'react';
import { Action } from './types';
import { SplitRow, IndentTree, Label } from './layout';

type PropsProps = {
	fiber: LiveFiber<any>,
};

export const Props: React.FC<PropsProps> = ({fiber}) => {
  // @ts-ignore
	const {id, f, arg, args} = fiber;
  const name = (f?.displayName ?? f?.name) || 'Node';
	let props = {} as Record<string, any>;

  if (arg !== undefined) {
    if (name === 'YEET') {
			props = {yeet: arg};
    }
		else {
			props = {props: arg};
		}
  }

  if (args !== undefined) {
    if (name === 'MAP_REDUCE') {
      const [, map, reduce] = args;
			props = {map, reduce};
    }
    else if (name === 'PROVIDE') {
      const [context, value] = args;
			props = {context, value};
    }
    else if (name === 'GATHER') {
    }
    else {
			if (args.length === 1) props = args[0];
			else for (let k in args) props[k] = args[k];
    }
  }

	return (<>
		<div><b>{name}</b></div>
		<div>{inspectObject(props)}</div>
	</>);
}

const inspectObject = (object: Object) => {
	if (!object) return null;
	if (Object.keys(object).join('/') === 'f/args/key') return formatNode(object);
	return Object.keys(object).map((k: string) => (
		<SplitRow key={k}>
			<Label>{k}</Label>
			<div>{
				typeof object[k] === 'object' ? <IndentTree>{inspectObject(object[k])}</IndentTree> : formatValue(object[k])
			}</div>
		</SplitRow>
	));
}