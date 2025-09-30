import type { LiveFiber, LiveComponent, LiveElement, LC, PropsWithChildren } from '@use-gpu/live';
import type { InspectExtension, InspectAppearance, InspectAddIns, OptionState } from './components/types';
import { fragment, use, useMemo, useOne, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

import React from 'react';
import { Inspect } from './components/inspect';
import { AddInProvider, defaultPanels } from './providers/add-in-provider';
import { AppearanceProvider } from './providers/appearance-provider';

export type UseInspectProps = PropsWithChildren<{
  fiber: LiveFiber<any>,
  active?: boolean,
  sub?: string,
  provider?: LiveComponent<any>,
  container?: Element,
  appearance?: Partial<InspectAppearance>,
  extensions?: InspectExtension[],

  findFiber?: number,
  initialState?: Partial<OptionState>,
  save?: boolean,
}>;

const STYLE = {
  position: 'absolute',
  inset: '0',
  pointerEvents: 'none',
  zIndex: 10000,
};

const NO_EXT: any[] = [];

export const UseInspect: LiveComponent<UseInspectProps> = ({
  fiber,
  sub,
  container,
  provider,
  extensions = NO_EXT,
  children,
  findFiber,
  appearance,
  initialState,
  save,
  active = true,
}) => {
  if (!fiber) throw new Error("<UseInspect> Must supply fiber to inspect");

  const [layout, setLayout] = useState<boolean>(false);
  const handleInspect = () => setLayout(l => !l);

  const debug = useOne(() => ({layout: {inspect: layout}}), layout);

  const addIns = useMemo(() => {
    const out: any = {
      props: [],
      prop: [],
    };

    for (const ext of [defaultPanels, ...extensions]) {
      const config = ext(fiber);
      for (const k in config) {
        if (!out[k]) out[k] = [];

        const v = config[k]
        if (Array.isArray(v)) out[k].push(...v);
        else out[k].push(v);
      }
    }

    return out;
  }, [extensions]);

  return fragment([
    provider ? use(provider, {debug, children}) : children,
    active ? use(HTML, {
      container: container ?? document.body,
      style: STYLE,
      inspectable: false,
      children:
        <AddInProvider addIns={addIns}>
          <AppearanceProvider appearance={appearance}>
            <Inspect
              fiber={fiber}
              sub={sub}
              onInspect={handleInspect}
              findFiber={findFiber}
              initialState={initialState}
              save={save}
            />
          </AppearanceProvider>
        </AddInProvider>
    }) : null
  ]);
}
