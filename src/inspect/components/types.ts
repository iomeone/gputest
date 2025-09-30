import type { ReactNode } from 'react';
import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';

export type ExpandState = Record<string | number, boolean>;
export type PingState = Record<number, number>;
export type SelectState = LiveFiber<any> | null;
export type FocusState = number | null;
export type HoverState = {
  fiber: LiveFiber<any> | null,
  by: LiveFiber<any> | null,
  root: LiveFiber<any> | null,
  deps: number[],
  precs: number[],
  depth: number,
};
export type OptionState = {
  open: boolean,
  depth: number,
  counts: boolean,
  builtins: boolean,
  fullSize: boolean,
  highlight: boolean,
  inspect: boolean,
  tab: string,
  splitLeft: number,
  splitBottom: number,
};

export type InspectAppearance = {
  close: boolean,
  toolbar: boolean,
  legend: boolean,
  resize: boolean,
  tabs: boolean
  select: boolean,
  skip: number,
};

export type Action = () => void;

export type InspectExtension = (root: LiveFiber<any>) => InspectAddIns;

export type InspectAddIns = {
  props: InspectProps[],
  prop: InspectProp[],
};

export type InspectProps = {
  id: string,
  label: string,
  enabled: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>) => boolean,
  render: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>, api: InspectAPI) => ReactNode,
};

export type InspectProp = {
  id: string,
  enabled: (prop: any) => boolean,
  render: (prop: any) => ReactNode,
};

type Handler<E extends Event> = (event: E) => void;

export type InspectState = {
  expandedCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  focusedCursor: Cursor<FocusState>,
  hoveredCursor: Cursor<HoverState>,
};

export type InspectAPI = {
  selectFiber: (fiber: LiveFiber<any> | null | undefined) => void,
  focusFiber: (fiber: LiveFiber<any> | null | undefined) => void,
  hoverFiber: (fiber: LiveFiber<any> | null | undefined, fibers: Map<number, LiveFiber<any>>, renderDepth?: number) => void,
  makeHandlers: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>, renderDepth?: number) => {
    select: Handler<MouseEvent>,
    hover: Handler<MouseEvent>,
    unhover: Handler<MouseEvent>,
    focus: Handler<FocusEvent>,
  },
};

