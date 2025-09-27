import type { LiveComponent } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { VectorLike } from '@use-gpu/traits';
import type { ColorTrait, PointTrait, ROPTrait } from '../types';

import { PointLayer } from '@use-gpu/workbench';
import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';

import { DataContext } from '../providers/data-provider';
import {
  useColorTrait,
  usePointTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

export type PointProps =
  Partial<ColorTrait> &
  Partial<PointTrait> &
  Partial<ROPTrait> & {

  colors?: ShaderSource,
  sizes?: ShaderSource,
  depths?: ShaderSource,
};

export const Point: LiveComponent<PointProps> = (props) => {
  const {colors, sizes, depths} = props;

  const positions = useContext(DataContext) ?? undefined;

  const {size, depth, shape} = usePointTrait(props);
  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  return (
    use(PointLayer, {
      positions,

      color,
      size,
      depth,
      shape,
      
      colors,
      sizes,
      depths,
    })
  );
};

