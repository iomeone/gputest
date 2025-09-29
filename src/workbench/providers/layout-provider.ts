import { makeContext, useContext } from '@use-gpu/live';

type Rectangle = [number, number, number, number];
type LayoutContextProps = Rectangle;

export const LayoutContext = makeContext<LayoutContextProps>(undefined, 'LayoutContext');

export const useLayoutContext = () => useContext(LayoutContext);