import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { ColorTrait, PointTrait, ROPTrait, VectorLike } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';

import { DataContext } from '../../providers/data-provider';
import {
  parseFloat,
  parseDetail,
  parsePosition4,
} from '../util/parse';
import {
  useColorTrait,
  usePointTrait,
  useROPTrait,
  useProp,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { PointLayer } from '../../layers/point-layer';

export type PointProps =
  Partial<ColorTrait> &
  Partial<PointTrait> &
  Partial<ROPTrait> & {

  colors?: StorageSource,
  sizes?: StorageSource,
  depths?: StorageSource,
};

export const Point: LiveComponent<PointProps> = (props) => {
  const {colors, sizes, depths} = props;

  const positions = useContext(DataContext);

  const {size, depth} = usePointTrait(props);
  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const d = useProp(detail, parseDetail);
  const o = useProp(offset, parsePosition4);

  return (
    use(PointLayer, {
      positions,

      color,
      size,
      depth,
      
      colors,
      sizes,
      depths,
    })
  );
};

