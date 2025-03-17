import type { ReactNode } from 'react';
import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';

export type ExpandState = Record<string | number, boolean>;
export type PingState = Record<number, number>;
export type FocusState = number | null;
export type SelectState = LiveFiber<any> | null;
export type HoverState = {
  fiber: LiveFiber<any> | null,
  depth: number,
};

export type HighlightState = {
  fiber: LiveFiber<any> | null,
  by: LiveFiber<any> | null,
  root: LiveFiber<any> | null,
  deps: number[],
  precs: number[],
};

export type OptionsState = {
  open: boolean,
  depthLimit: number,
  runCounts: boolean,
  builtins: boolean,
  fullSize: boolean,
  highlight: boolean,
  inspect: boolean,
  tab: string | null,
  preferredTab: string,
  splitLeft: number,
  splitBottom: number,
  filterTags: number,

  version: number,
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
  filters: InspectFilter[],
};

export type InspectProps = {
  key: string,
  label: string,
  icon?: ReactNode,
  enabled: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>) => boolean,
  render: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>, api: InspectAPI) => ReactNode,
};

export type InspectProp = {
  key: string,
  enabled: (prop: any) => boolean,
  render: (prop: any) => ReactNode,
};

export type InspectFilter = {
  key: number,
  label: ReactNode,
  icon: ReactNode,
  group?: number,
  order?: number,
};

type Handler<E extends Event> = (event: E) => void;

export type InspectState = {
  expandedCursor: Cursor<ExpandState>,
  optionsCursor: Cursor<OptionsState>,

  selectedState: SelectState,
  focusedState: FocusState,
  hoveredState: HoverState,
  highlightState: HighlightState,
};

export type InspectAPI = {
  forceUpdate: () => void,
  selectFiber: (fiber: LiveFiber<any> | null | undefined) => void,
  focusFiber: (fiber: LiveFiber<any> | null | undefined) => void,
  hoverFiber: (fiber: LiveFiber<any> | null | undefined, renderDepth?: number) => void,
  makeHandlers: (fiber: LiveFiber<any>, renderDepth?: number) => {
    select: Handler<MouseEvent>,
    hover: Handler<MouseEvent>,
    unhover: Handler<MouseEvent>,
    focus: Handler<FocusEvent>,
  },
};

