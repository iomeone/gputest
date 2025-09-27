import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, Emit } from '@use-gpu/core';

import { yeet, use, gather, provide, useContext, useMemo, useOne, tagFunction } from '@use-gpu/live';
import { SampledData } from '@use-gpu/workbench';
import { DataContext } from '../providers/data-provider';
import { RangeContext } from '../providers/range-provider';
import { parseAxis } from '@use-gpu/traits';

export type SampledProps = {
  axis?: string,
  axes?: string,

  range?: [number, number][],
  size: number[],

  sparse?: boolean,
  centered?: boolean[] | boolean,
  expr?: (emit: Emit, ...args: number[]) => void,
  items?: number,

  format?: string,
  live?: boolean,
  time?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
  children?: LiveElement<any>,
};

export const Sampled: LiveComponent<SampledProps> = (props) => {
  const {
    axis,
    axes = 'xyzw',
    render,
    range: outerRange,
    children,
    ...rest
  } = props;

  const parentRange = useContext(RangeContext);
  const resolvedRange = outerRange ?? parentRange;

  const a = axis ?? axes;
  const range = useMemo(() => {
    const basis = a.split('').map(parseAxis);
    return basis.map(i => resolvedRange[i]);
  }, [resolvedRange, a]);

  return (
    gather(
      use(SampledData, {...rest, range}),
      tagFunction(([source]: StorageSource[]) =>
        useMemo(() => {
          if (render == null && children === undefined) return yeet(source);
          return (
            provide(DataContext, source, render != null ? render(source) : children)
          );
        }, [render, children, source])
      , 'sample')
    )
  );
};

