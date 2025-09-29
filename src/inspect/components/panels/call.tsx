import type { LiveFiber } from '@use-gpu/live';
import type { Action } from '../types';
import { formatNode, formatValue } from '@use-gpu/live';

import { Hook } from '@use-gpu/live';
import React, { useState } from 'react';
import { SplitRow, Label, Spacer } from '../layout';
import { InspectObject } from '../inspect-object';
import chunk from 'lodash/chunk';

const STATE_SLOTS = 3;

type CallProps = {
  fiber: LiveFiber<any>,
};

export const Call: React.FC<CallProps> = ({fiber}) => {
  // @ts-ignore
  const {id, depth, runs, path, order, keys, type, state, context, yeeted, quote, unquote, mount, mounts, next, ...rest} = fiber;

  let props = {id, runs, depth, path, keys, '[internals]': rest} as any;
  let env = {context, yeeted, quote, unquote} as any;
  let rendered = {type, mount, mounts, next, order} as any;

  if (!mount) delete rendered.mount;
  if (!mounts) delete rendered.mounts;
  if (!next) delete rendered.next;

  if (!context.values.size) delete env.context;
  if (!yeeted) delete env.yeeted;
  if (!quote) delete env.quote;
  if (!unquote) delete env.unquote;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) => setExpanded((state) => ({
    ...expanded,
    [id]: !expanded[id],
  }));

  const hooks = chunk(state, STATE_SLOTS);

  return (
    <div>
      <div><b>Fiber</b></div>
      <div><InspectObject object={props} state={expanded} toggleState={toggleExpanded} /></div>
      <Spacer />
      <div><b>Rendered</b></div>
      <div><InspectObject object={rendered} state={expanded} toggleState={toggleExpanded} /></div>
      {Object.keys(env).length ? (<>
        <Spacer />
        <div><b>Environment</b></div>
        <div><InspectObject object={env} state={expanded} toggleState={toggleExpanded} /></div>        
      </>) : null}
      {hooks.length ? (<>
        <Spacer />
        <div><b>Hooks</b></div>
        <div>
          <div><InspectObject object={hooks.map(hookToObject)} state={expanded} toggleState={toggleExpanded} /></div>
        </div>
      </>) : null}
    </div>
  );
}

const hookToObject = (
  state: any[],
) => {
  const [type, a, b] = state;
  if (type === Hook.STATE) {
    return {state: a, setter: b};
  }
  if (type === Hook.MEMO || type === Hook.ONE || type === Hook.CALLBACK) {
    return {memo: a, deps: b};
  }
  if (type === Hook.RESOURCE) {
    return {resource: a?.value, deps: b};
  }
  if (type === Hook.CONTEXT) {
    return {context: b?.displayName};
  }
  if (type === Hook.CAPTURE) {
    return {capture: b?.displayName};
  }
  if (type === Hook.VERSION) {
    return {version: b, value: a};
  }
  if (type === Hook.YOLO) {
    return a ? {skip: a} : {scope: b};
  }
  return null;
}
