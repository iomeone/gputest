import { makeContext, useContext } from '../../live';

type Rectangle = [number, number, number, number];
type LayoutContextProps = Rectangle;

export const LayoutContext = makeContext<LayoutContextProps>(undefined, 'LayoutContext');

export const useLayoutContext = () => useContext(LayoutContext);