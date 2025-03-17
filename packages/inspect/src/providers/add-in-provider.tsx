import type { InspectAddIns, InspectExtension } from '../components/types';
import React, { createContext, useContext, PropsWithChildren } from 'react';

import { Props } from '../components/tabs/props';
import { Call } from '../components/tabs/call';
import { Layout } from '../components/tabs/layout';

import { SVGDashboard, SVGNextFence, SVGHighlightElement, SVGQuote, SVGYeet, SVGAtom, SVGOther, SVGChevronDown } from '../components/svg';
import { FiberTag } from '../components/fiber/tag';

const AddInContext = createContext<InspectAddIns>({
  props: [],
  prop: [],
  filters: [],
});

export const AddInProvider = ({
  addIns, children,
}: PropsWithChildren<{
  addIns: InspectAddIns,
}>) => (
  <AddInContext.Provider value={addIns} children={children} />
);

export const useAddIns = () => useContext(AddInContext);

export const defaultPanels: InspectExtension = (): InspectAddIns => ({
  props: [
    {
      key: 'props',
      label: 'Props',
      enabled: () => true,
      render: (fiber, fibers, api) => <Props fiber={fiber} fibers={fibers} api={api} />,
    },
    {
      key: 'fiber',
      label: 'Fiber',
      enabled: () => true,
      render: (fiber) => <Call fiber={fiber} />,
    },
    {
      key: 'layout',
      label: 'Layout',
      icon: <SVGDashboard />,
      enabled: (fiber) => fiber.__inspect?.layout,
      render: (fiber) => <Layout fiber={fiber} />,
    },
  ],
  prop: [],
  filters: [
    {
      key: FiberTag.Highlight,
      label: 'Highlight',
      icon: <SVGHighlightElement />,
      group: 0,
    },
    {
      key: FiberTag.React,
      label: 'React',
      icon: <SVGAtom />,
      group: 0,
      order: 1e5,
    },
    {
      key: FiberTag.Reconcile,
      label: 'Reconcile',
      icon: <SVGNextFence />,
      group: 1,
    },
    {
      key: FiberTag.Yeet,
      label: 'Yeet',
      icon: <SVGYeet />,
      group: 1,
    },
    {
      key: FiberTag.Quote,
      label: 'Quote',
      icon: <SVGQuote />,
      group: 1,
    },
    {
      key: FiberTag.By,
      label: 'Include Rendered By',
      icon: <SVGChevronDown />,
      group: 1e5,
    },
    {
      key: FiberTag.Other,
      label: 'Other',
      icon: <SVGOther />,
      group: 1e5,
    },
  ],
});

