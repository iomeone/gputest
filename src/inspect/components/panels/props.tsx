import type { LiveFiber } from '@use-gpu/live';
import type { Action } from '../types';

import { formatNode, formatNodeName, YEET } from '@use-gpu/live';
import { InspectObject } from '../inspect-object';
import { Spacer } from '../layout';

import React, { useLayoutEffect, useState } from 'react';

import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

type PropsProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  selectFiber: (fiber: LiveFiber<any>) => void,
};

export const FiberName = styled('span', {
  color: 'var(--LiveInspect-colorTextActive)',
  marginRight: 10,
});

export const Fiber = styled('div', {
  cursor: 'pointer',
  display: 'flex',
  '& > div': {
    margin: '0px -4px',
    padding: '2px 4px',
  },
  '&:hover > div': {
    background: "#444",
  },
});

export const Props: React.FC<PropsProps> = ({fiber, fibers, selectFiber}) => {
  // @ts-ignore
  const {id, f, arg, args, yeeted} = fiber;
  const name = formatNodeName(fiber);
  let props = {} as Record<string, any>;

  const [state, setState] = useState<Record<string, boolean>>({});
  const toggleState = (id: string) => setState((state) => ({
    ...state,
    [id]: !state[id],
  }));

  if (arg !== undefined) {
    if (f.name === 'YEET') {
      props = {yeet: arg};
    }
    else {
      props = {props: arg};
    }
  }

  if (args !== undefined) {
    if (f.name === 'YEET') {
      props = {};
    }
    if (f.name === 'MAP_REDUCE') {
      const [children, map, reduce] = args;
      props = {map, reduce, children};
    }
    else if (f.name === 'CAPTURE') {
      const [context] = args;
      props = {context};
    }
    else if (f.name === 'PROVIDE') {
      const [context, value] = args;
      props = {context, value};
    }
    else if (f.name === 'GATHER') {
      const [children, then, fallback] = args;
      props = {children, then, fallback};
    }
    else if (f.name === 'SIGNAL') {
    }
    else {
      if (args.length === 1 && typeof args[0] === 'object') props = args[0];
      else for (let k in args) props[k] = args[k];
    }
  }

  let yt = (yeeted?.value ?? yeeted?.reduced) != null ? (<>
    <div><b>Yeeted</b></div>
    {yeeted?.value != null ? ( 
      <div><InspectObject
        object={{value: yeeted?.value}}
        state={state}
        toggleState={toggleState}
        path={''}
      /></div>
    ) : null}
    {yeeted?.reduced != null ? ( 
      <div><InspectObject
        object={{reduced: yeeted?.reduced}}
        state={state}
        toggleState={toggleState}
        path={''}
      /></div>
    ) : null}
  </>) : null;

  let showProps = f !== YEET;

  const getHistory = () => {
    let parent = fiber;
    if (parent.by) {
      const parents = [] as LiveFiber<any>[];
      while (parent) {
        const {by} = parent;
        const source = fibers.get(by);
        if (source) parents.push(source);
        parent = source as any;
      }
      if (parents.length) {
        return parents.map((fiber) => {
          const text = formatNode(fiber);
          const name = formatNodeName(fiber);
          const parts = text.split(name);
          return (
            <Fiber key={fiber.id} onClick={() => {
              selectFiber(fiber);
            }}><div>
              {parts[0]}
              <FiberName>{name}</FiberName>
              {parts.slice(1).join(' ')}
            </div></Fiber>
          );
        });
      }
    }
    return '[Runtime]';
  };

  let [history, setHistory] = useState(getHistory);
  useLayoutEffect(() => {
    const h = getHistory();
    if (h.length !== history.length) setHistory(h);
  });

  return (<>
    {showProps ? (
      <>
        <div><b>{name}</b></div>
        <div><InspectObject
          object={props}
          state={state}
          toggleState={toggleState}
          path={''}
        /></div>
      </>
    ) : null}
    {showProps && yt ? <Spacer /> : null}
    {yt}
    <Spacer />
    <div><b>Rendered By</b></div>
    <div>{history}</div>
  </>);
}

