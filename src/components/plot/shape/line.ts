import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { ColorTrait, LineTrait, ROPTrait, VectorLike } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';

import { DataContext } from '../../providers/data-provider';
import {
  parseFloat,
  parseDetail,
  parsePosition4,
} from '../util/parse';
import {
  useColorTrait,
  useLineTrait,
  useROPTrait,
  useProp,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { LineLayer } from '../../layers/line-layer';

export type LineProps =
  Partial<ColorTrait> &
  Partial<LineTrait> &
  Partial<ROPTrait> & {

  colors?: StorageSource,
  widths?: StorageSource,
  depths?: StorageSource,
};

export const Line: LiveComponent<LineProps> = (props) => {
  const {colors, widths, depths} = props;

  const positions = useContext(DataContext);

  const {width, depth, join} = useLineTrait(props);
  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const s = useProp(size, parseFloat);
  const d = useProp(detail, parseDetail);
  const o = useProp(offset, parsePosition4);

  return (
    use(LineLayer, {
      positions,

      color,
      width,
      depth,
      join,

      colors,
      widths,
      depths,
    })
  );
};

