import React, { FC, useRef } from 'react';
import { InspectProp } from './types';

import { formatNode, formatValue, YEET } from '@use-gpu/live';
import { SplitRow, TreeRow, TreeIndent, Label, Spacer, Selectable } from './layout';
import { IconItem, SVGChevronDown, SVGChevronRight } from './svg';
import { useAddIns } from '../providers/add-in-provider';

import { styled as _styled } from '@stitches/react';

const styled: any = _styled;

const CODE_HEIGHT = 250;

const Compact = styled('span', {
  whiteSpace: 'nowrap',
});

const Prefix = styled('div', {
  width: '20px',
  display: 'inline-block',
  whiteSpace: 'nowrap',
  lineHeight: 1,
});

export type InspectObjectProps = {
  object: any,
  state: Record<string, boolean>,
  toggleState: (id: string) => void,
  path?: string,
  seen?: Set<any>,
  depth?: number,
};

export const InspectObject: FC<InspectObjectProps> = (props: InspectObjectProps) => {
  let {
    object,
    state,
    toggleState,
    path = '',
    seen = new Set(),
    depth = 0,
  } = props;
  if (!object) return null;

  if (seen.has(object)) return <span>{`{Repeated}`}</span>;
  seen.add(object);

  let extra = false;
  let keys;

  if (Array.isArray(object)) {
    let n = object.length;
    if (n > 100) {
      object = object.slice(0, 100);
      extra = true;
    }
    if (object.reduce((b: boolean, o: any) => b && typeof o === 'number', true)) {
      return <Selectable>{`[${object.join(', ')}${extra ? '…' : ''}]`}</Selectable>;
    }
  }

  if (object?.constructor?.name?.match(/Array/)) {
    if (!object.buffer && object.byteLength != null) {
      object = new Uint8Array(object.slice(0, 100));
      extra = object.byteLength > 100;
    }
    if (object.length > 100) {
      object = object.slice(0, 100);
      extra = true;
    }
  }

  if (object instanceof Map) {
    const o = {} as Record<string, any>;
    let i = 0;
    for (let k of object.keys()) {
      const v = object.get(k);
      if (k instanceof Object) {
        if (k?.displayName != null) k = `{${k.displayName}}`;
        else if (k?.id != null) k = `{${k.id}}`;
        else k = `{${i++}}`;
      }
      o[k] = v;
    }
    object = o;
  }

  const coordsRef = useRef([-1e3, -1e3]);

  keys = keys ?? Reflect.ownKeys(object) as string[];

  const fields = keys.map((k: string) => {
    const key = path +'/'+ k;
    const code = (typeof object[k] === 'string' && object[k].length > 80 && object[k].match(/\n/));
    const expandable = (typeof object[k] === 'object' && object[k]) || code;
    const expanded = expandable && !!state[key];

    const icon = <IconItem height={16} top={2}>{expanded !== false ? <SVGChevronDown /> : <SVGChevronRight />}</IconItem>;
    const prefix = expandable ? icon : '';

    const onPointerDown = expandable ? (e: any) => {
      coordsRef.current = [e.clientX, e.clientY];
    } : undefined;

    const onClick = expandable ? (e: any) => {
      const {current: [x, y]} = coordsRef;
      const dx = Math.abs(e.clientX - x);
      const dy = Math.abs(e.clientY - y);
      if (dx + dy > 2) return;

      toggleState(key);
      e.preventDefault();
      e.stopPropagation();
    } : undefined;

    const compact = <Compact>
      {expanded ? formatValue(object[k]) : truncate(formatValue(object[k]), 80)}
    </Compact>

    const full = expanded ? (
      <TreeIndent indent={1}>{
        code
        ? <InspectCode
            code={object[k]}
          />
        : <InspectObject
            object={object[k]}
            state={state}
            toggleState={toggleState}
            path={key}
            seen={seen}
            depth={depth + 1}
          />
      }</TreeIndent>
    ) : null;

    let proto = object[k]?.__proto__ !== Object.prototype
      ? object[k]?.__proto__?.constructor?.name ??
        object[k]?.__proto__?.displayName ??
        object[k]?.__proto__?.name
      : 'Object';

    if (object[k]?.length) proto += ' (' + object[k]?.length + ')';

    const showFull = (typeof object[k] === 'object' && depth < 20) || code;
    if (showFull && expanded) {
      return (
        <div key={k} onPointerDown={onPointerDown} onClick={onClick}>
          <TreeRow>
            <SplitRow>
              <Label><Prefix>{prefix}</Prefix><div>{k}</div></Label>
              <Selectable>{proto ?? ''}</Selectable>
            </SplitRow>
          </TreeRow>
          <div>{full}</div>
        </div>
      );
    }

    return (
      <div key={k} onPointerDown={onPointerDown} onClick={onClick}>
        <TreeRow>
          <SplitRow>
            <Label><Prefix>{prefix}</Prefix><div>{k}</div></Label>
            <Selectable>{compact}</Selectable>
          </SplitRow>
        </TreeRow>
      </div>
    );
  });

  return <>{fields}</>;
}

const truncate = (s: string, n: number) => {
  s = s.replace(/\s+/g, ' ');
  if (s.length < n) return s;
  return s.slice(0, n) + '…';
}

type InspectCodeProps = {
  code: string,
};

export const InspectCode = (props: InspectCodeProps) => {
  const {code} = props;
  const render = (code: string) => <div
    style={{
      background: '#404040',
      padding: '3px 5px',
      font: '11px monospace',
      lineHeight: '14px',
      whiteSpace: 'pre',
      minHeight: '100%',
    }}>{code}</div>;

  const addIns = useAddIns();
  const addIn = addIns.prop.find((addIn) => addIn.enabled(code)) ?? {render};

  return (
    <div
      style={{height: CODE_HEIGHT}}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: CODE_HEIGHT,
        overflow: 'auto',
        userSelect: 'text',
      }}>
        {addIn.render(code)}
      </div>
    </div>
  );
};
