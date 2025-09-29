import type { LiveComponent } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { ColorTrait, LineTrait, ROPTrait, VolumeTrait } from '../types';

import { use, useContext } from '@use-gpu/live';
import { DualContourLayer } from '@use-gpu/workbench';

import { useRangeContext } from '../providers/range-provider';
import { useDataContext } from '../providers/data-provider';
import {
  useColorTrait,
  useVolumeTrait,
  useROPTrait,
} from '../traits';

export type ImplicitSurfaceProps =
  Partial<ColorTrait> &
  Partial<ROPTrait> &
  Partial<VolumeTrait> & {
    normals?: ShaderSource,
    method?: 'linear' | 'quadratic',
    padding?: number,
    level?: number,
};

export const ImplicitSurface: LiveComponent<ImplicitSurfaceProps> = (props: ImplicitSurfaceProps) => {
  const values =  useDataContext() ?? undefined;
  const range = useRangeContext();

  const {
    level = 0,
    padding = 1,
    method = 'linear',
  } = props;
  const {loopX, loopY, loopZ, shaded} = useVolumeTrait(props);
  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  let normals = props.normals;

  return (
    use(DualContourLayer, {
      range,
      values,
      normals,
      color,
      level,
      padding,
      method,
      loopX,
      loopY,
      loopZ,
      shaded,
      ...rop,
    })
  );
};
