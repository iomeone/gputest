import type { InspectAddIns, InspectExtension } from '../components/types';
import React, { createContext, useContext, PropsWithChildren } from 'react';

import { Props } from '../components/panels/props';
import { Call } from '../components/panels/call';
import { Layout } from '../components/panels/layout';

import { IconRow, SVGDashboard } from '../components/svg';

const AddInContext = createContext<InspectAddIns>({
  props: [],
  prop: [],
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
      id: 'props',
      label: <span>Props</span>,
      enabled: () => true,
      render: (fiber, fibers, api) => <Props fiber={fiber} fibers={fibers} api={api} />,
    },
    {
      id: 'fiber',
      label: <span>Fiber</span>,
      enabled: () => true,
      render: (fiber) => <Call fiber={fiber} />,
    },
    {
      id: 'layout',
      label: <span>Layout <IconRow><SVGDashboard /></IconRow></span>,
      enabled: (fiber) => fiber.__inspect?.layout,
      render: (fiber) => <Layout fiber={fiber} />,
    },
  ],
  prop: [],
});
