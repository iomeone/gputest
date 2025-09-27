import { makeContext, useContext } from '@use-gpu/live';

export type RangeContextProps = [number, number][];
const DEFAULT_RANGE: RangeContextProps = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]];

export const RangeContext = makeContext<RangeContextProps>(DEFAULT_RANGE, 'RangeContext');
export const useRangeContext = () => useContext<RangeContextProps>(RangeContext);

