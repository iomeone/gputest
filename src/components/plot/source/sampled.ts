import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { StorageSource, Emitter } from '@use-gpu/core/types';

import { yeet, use, gather, provide, useContext, useMemo, useOne, tagFunction } from '@use-gpu/live';
import { SampledData } from '../../data/sampled-data';
import { DataContext } from '../../providers/data-provider';
import { RangeContext } from '../../providers/range-provider';
import { parseAxis } from '../util/parse';

export type SampledProps = {
  axis?: string,
  axes?: string,

  range: [number, number][],
  size: number[],

  centered?: boolean[] | boolean,
  expr?: (emit: Emitter, ...args: number[]) => void,
  items?: number,

  format?: string,
  live?: boolean,

  render?: (source: StorageSource) => LiveElement<any>,
  children?: LiveElement<any>,
};

export const Sampled: LiveComponent<SampledProps> = (props) => {
  const parentRange = useContext(RangeContext);
  const {
    axis,
    axes = 'xyzw',
    render,
    children,
    ...rest
  } = props;
  
  const basis = (axis ?? axes).split('').map(parseAxis);
  const range = basis.map(i => parentRange[i]);

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

