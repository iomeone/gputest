import type { ReactNode } from 'react';
import type { LiveFiber } from '@use-gpu/live';

export type ExpandState = Record<number, boolean>;
export type PingState = Record<number, number>;
export type SelectState = LiveFiber<any> | null;
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
  render: (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>, selectFiber: (fiber: LiveFiber<any>) => void) => ReactNode,
};

export type InspectProp = {
  id: string,
  enabled: (prop: any) => boolean,
  render: (prop: any) => ReactNode,
};
