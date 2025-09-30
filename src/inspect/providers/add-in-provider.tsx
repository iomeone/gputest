import type { InspectAddIns, InspectExtension } from '../components/types';
import React, { createContext, useContext, PropsWithChildren } from 'react';

import { Props } from '../components/panels/props';
import { Call } from '../components/panels/call';
import { Layout } from '../components/panels/layout';

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
      label: 'Props',
      enabled: (fiber) => true,
      render: (fiber, fibers, api) => <Props fiber={fiber} fibers={fibers} api={api} />,
    },
    {
      id: 'fiber',
      label: 'Fiber',
      enabled: () => true,
      render: (fiber) => <Call fiber={fiber} />,
    },
    {
      id: 'layout',
      label: 'Layout',
      enabled: (fiber) => fiber.__inspect?.layout,
      render: (fiber) => <Layout fiber={fiber} />,
    },
  ],
  prop: [],
});
