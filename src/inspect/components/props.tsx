import { LiveFiber } from '@use-gpu/live/types';
import { formatNode, formatValue, formatNodeName } from '@use-gpu/live';
import styled, { keyframes } from "styled-components";

import React, { useState } from 'react';
import { Action } from './types';
import { SplitRow, ExpandRow, IndentTree, Label } from './layout';

const ICON = (s: string) => <span className="m-icon">{s}</span>

type PropsProps = {
	fiber: LiveFiber<any>,
};

const Prefix = styled.div`
	width: 20px;
	display: inline-block;
	white-space: nowrap;
	line-height: 1;
`;

const Compact = styled.span`
	white-space: nowrap;
`;

export const Props: React.FC<PropsProps> = ({fiber}) => {
  // @ts-ignore
	const {id, f, arg, args} = fiber;
  const name = formatNodeName(fiber);
	let props = {} as Record<string, any>;

	const [state, setState] = useState<Record<string, boolean>>({});
	const toggleState = (id: string) => setState((state) => ({
		...state,
		[id]: !state[id],
	}));

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
			if (args.length === 1 && typeof args[0] === 'object') props = args[0];
			else for (let k in args) props[k] = args[k];
    }
  }

	return (<>
		<div><b>{name}</b></div>
		<div>{inspectObject(props, state, toggleState, '')}</div>
	</>);
}

export const inspectObject = (
	object: any,
	state: Record<string, boolean>,
	toggleState: (id: string) => void,
	path: string,
	seen: Set<any> = new Set(),
	depth: number = 0,
) => {
	if (!object) return null;

	if (seen.has(object)) return '{Circular}';
	seen.add(object);

	if (Array.isArray(object)) if (object.reduce((b, o) => b && typeof o === 'number', true)) {
		return `[${object.join(', ')}]`;
	}

	if (object instanceof Map) {
		const o = {} as Record<string, any>;
		let i = 0;
		for (let k of object.keys()) {
			const v = object.get(k);
			if (k instanceof Object) k = (i++).toString();
			o[k] = v;
		}
		object = o;
	}

	const signature = Object.keys(object).join('/');
	// @ts-ignore
	if ((signature === 'f/args/key') && object.f && object.args) {
		if (!object.f.isLiveBuiltin) {
			object = Object.assign(Object.create(object.f), {
				component: object.f,
				props: object.args[0],
				key: object.key,
			});
		}
		else {
			object = Object.assign(Object.create(object.f), {
				component: object.f,
				args: object.args,
				arg: object.arg,
				key: object.key,
			});
		}
	}

	const fields = Object.keys(object).map((k: string) => {
		const key = path +'/'+ k;
		const expandable = typeof object[k] === 'object' && object[k];
		const expanded = !!state[key];

		const icon = expanded !== false ? ICON('expand_more') : ICON('chevron_right') ;
		const prefix = expandable ? icon : '';
		
		const onClick = expandable ? (e: any) => {
			toggleState(key);
			e.preventDefault();
			e.stopPropagation();
		} : undefined;

		const compact = <Compact>
			{expanded ? formatValue(object[k]) : truncate(formatValue(object[k]), 80)}
		</Compact>

		const full = expanded ? (
			<IndentTree>{inspectObject(object[k], state, toggleState, key, seen, depth + 1)}</IndentTree>
		) : null;

	  const proto = object[k]?.__proto__ !== Object.prototype
			? object[k]?.__proto__?.constructor?.name ??
			  object[k]?.__proto__?.displayName
			: null;

		const showFull = typeof object[k] === 'object' && depth < 20;
		if (showFull && expanded) {
			return (
				<div key={k} onClick={onClick}>
					<ExpandRow>
						<SplitRow>
							<Label><Prefix>{prefix}</Prefix><div>{k}</div></Label>
							<div>{proto}</div>
						</SplitRow>
					</ExpandRow>
					<div>{full}</div>
				</div>
			);
		}

		return (
			<div key={k} onClick={onClick}>
				<ExpandRow>
					<SplitRow>
						<Label><Prefix>{prefix}</Prefix><div>{k}</div></Label>
						<div>{compact}</div>
					</SplitRow>
				</ExpandRow>
			</div>
		);
	});
	
	return fields;
}

const truncate = (s: string, n: number) => {
	if (s.length < n) return s;
	return s.slice(0, n) + '…';
}
