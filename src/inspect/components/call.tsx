import { LiveFiber, Hook } from '@use-gpu/live/types';
import { formatNode, formatValue, STATE_SLOTS } from '@use-gpu/live';

import React, { useState } from 'react';
import { Action } from './types';
import { SplitRow, Label, Spacer } from './layout';

import { inspectObject } from './props';
import chunk from 'lodash/chunk';

type CallProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
};

export const Call: React.FC<CallProps> = ({fiber}) => {
  // @ts-ignore
  const {id, depth, path, type, state, context, yeeted, mount, mounts, next, host} = fiber;

  let props = {id, depth, path, type, context, yeeted, mount, mounts, next, host, '[raw]': fiber} as Record<string, any>;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) => setExpanded((state) => ({
    ...expanded,
    [id]: !expanded[id],
  }));

  const hooks = chunk(state, STATE_SLOTS);

  return (
    <div>
      <div><b>Fiber</b></div>
      <div>{inspectObject(props, expanded, toggleExpanded, '')}</div>
      <Spacer />
      <div><b>State</b></div>
      <div>
        {inspectObject(hooks.map(hookToObject), expanded, toggleExpanded, '')}
      </div>
    </div>
  );
}

const hookToObject = (
  state: any[],
) => {
  const [type, a, b] = state;
  if (type === Hook.STATE) {
    return {state: a, deps: b};
  }
  if (type === Hook.MEMO || type === Hook.ONE || type === Hook.CALLBACK) {
    return {memo: a, deps: b};
  }
  if (type === Hook.RESOURCE) {
    return {resource: a?.value, deps: b};
  }
  if (type === Hook.CONTEXT) {
    return {context: a?.displayName};
  }
  if (type === Hook.CONSUMER) {
    return {consumer: a?.displayName};
  }
  return null;
}
