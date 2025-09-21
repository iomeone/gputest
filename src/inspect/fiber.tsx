import { LiveFiber } from '../live/types';
import { useResource, formatValue } from '../live';

import React from 'react';

import { useRefineCursor } from './cursor';
import { Node } from './node';
import { ExpandState, SelectState, Action } from './types';
import { ExpandRow, NotExpandRow, IndentTree } from './layout';

type FiberProps = {
	fiber: LiveFiber<any>,
	ping: PingState,
	expandCursor: Cursor<ExpandState>,
	selectedCursor: Cursor<SelectState>,
}

export const Fiber: React.FC<FiberProps> = ({fiber, ping, expandCursor, selectedCursor}) => {
  const {id, mount, mounts, next} = fiber;
	const [selectState, updateSelectState] = selectedCursor;
	
	const pinged = ping[id] || 0;
	const selected = fiber === selectState;
	const select = () => {
		updateSelectState({ $set: fiber });
	}

	const node = <Node key='node' fiber={fiber} pinged={pinged} selected={selected} onClick={select} />;
	const out = [] as React.ReactElement[];

	if (mount) {
		out.push(
			<Fiber
				key='mount'
				fiber={mount}
				ping={ping}
				expandCursor={expandCursor}
				selectedCursor={selectedCursor}
			/>
		);
	}

  if (mounts) {
    for (const key of mounts.keys()) {
      const sub = mounts.get(key);
      if (sub) out.push(
				<Fiber
					key={key}
					fiber={sub}
					ping={ping}
					expandCursor={expandCursor}
					selectedCursor={selectedCursor}
				/>);
    }
  }

  if (next) {
    out.push(
			<Fiber
				key="next"
				fiber={next}
				ping={ping}
				expandCursor={expandCursor}
				selectedCursor={selectedCursor}
			/>
		);
  }

	if (out.length) {
		return (<>
			<Expand id={id.toString()} expandCursor={expandCursor} label={node}>
				<IndentTree>{out}</IndentTree>
			</Expand>
		</>);
	}

	return <NotExpandRow>{node}</NotExpandRow>;
}

type ExpandProps = {
	id: string,
	expandCursor: Cursor<ExpandState>,
	label: React.ReactElement,
}

const ICON = (s: string) => <span className="m-icon">{s}</span>

export const Expand: React.FC<ExpandProps> = ({id, label, expandCursor, children}) => {
	const [expand, updateExpand] = useRefineCursor(expandCursor)(id);

	const onClick = (e: any) => {
		updateExpand(expand === false);
		e.preventDefault();
	}

	const icon = expand !== false ? ICON('expand_more') : ICON('chevron_right') ;

	return (<>
		<ExpandRow>
			<div onClick={onClick}>{icon}</div>
			{label}
		</ExpandRow>
		{expand !== false ? children : null}
	</>);
}
