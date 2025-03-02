import type { InspectAppearance } from '../components/types';
import React, { useMemo, createContext, useContext, PropsWithChildren } from 'react';

const APPEARANCE: InspectAppearance = {
  close: true,
  toolbar: true,
  legend: true,
  resize: true,
  tabs: true,
  select: true,
  skip: 0,
};

const AppearanceContext = createContext<InspectAppearance>(APPEARANCE);

export const AppearanceProvider = ({
  appearance,
  children,
}: PropsWithChildren<{
  appearance?: Partial<InspectAppearance>,
}>) => {
  const appAppearance = useMemo(() => ({...APPEARANCE, ...appearance}), [appearance]);
  return <AppearanceContext.Provider value={appAppearance} children={children} />;
};

export const useAppearance = () => useContext(AppearanceContext);
