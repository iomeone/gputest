import { LiveFiber } from '@use-gpu/live/types';
import { useResource, formatValue } from '@use-gpu/live';

import React from 'react';

import { useRefineCursor, Cursor } from './cursor';
import { Node } from './node';
import { PingState, ExpandState, SelectState, Action } from './types';
import { ExpandRow, NotExpandRow, IndentTree, IndentTreeLine, IndentContinuation, IndentMini } from './layout';

const ICON = (s: string) => <span className="m-icon">{s}</span>
const ICONSMALL = (s: string) => <span className="m-icon m-icon-small">{s}</span>

type FiberProps = {
  fiber: LiveFiber<any>,
  ping: PingState,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  compact?: boolean,
}

export const Fiber: React.FC<FiberProps> = ({fiber, ping, compact, expandCursor, selectedCursor}) => {
  const {id, mount, mounts, next, order} = fiber;
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
        compact
      />
    );
  }

  if (mounts && order) {
    for (const key of order) {
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

  let nextRender = null;
  if (next) {
    const icon = ICONSMALL('subdirectory_arrow_right');
    nextRender = (
      <ExpandRow key="next">
        <div>{icon}</div>
        <IndentContinuation>
          <Fiber
            fiber={next}
            ping={ping}
            expandCursor={expandCursor}
            selectedCursor={selectedCursor}
          />
        </IndentContinuation>
      </ExpandRow>
    );
  }

  if (out.length || next) {
    const hasIndent = !compact || mounts || next;
    let Wrapper = IndentMini;

    if (hasIndent) Wrapper = IndentTree;
    if (next) Wrapper = IndentTreeLine;

    return (<>
      <Expand id={id.toString()} expandCursor={expandCursor} label={node}>
        {<Wrapper>{out}</Wrapper>}
        {nextRender}
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

export const Expand: React.FC<ExpandProps> = ({id, label, expandCursor, children}) => {
  const [expand, updateExpand] = useRefineCursor<boolean>(expandCursor)(id);

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
