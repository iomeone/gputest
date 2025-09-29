import type { LiveComponent } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { VectorLike } from '@use-gpu/traits';
import type { ColorTrait, LineTrait, ROPTrait } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';

import { useBoundShader, LineLayer } from '@use-gpu/workbench';
import { DataContext } from '../providers/data-provider';
import {
  useColorTrait,
  useLineTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { getLineSegment } from '@use-gpu/wgsl/geometry/segment.wgsl';

const LINE_ATTRIBUTE = bundleToAttribute(getLineSegment, 'getLineDetail');

export type LineProps =
  Partial<ColorTrait> &
  Partial<LineTrait> &
  Partial<ROPTrait> & {

  colors?: ShaderSource,
  widths?: ShaderSource,
  depths?: ShaderSource,
};

export const Line: LiveComponent<LineProps> = (props) => {
  const {colors, widths, depths} = props;

  const positions = useContext(DataContext) ?? undefined;

  const {width, depth, join} = useLineTrait(props);
  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const detailExpr = useOne(() => () => ((positions as any)?.size?.[0] || 1) - 1, positions);
  const segments = useOne(() => useBoundShader(getLineSegment, [detailExpr]), detailExpr);

  return (
    use(LineLayer, {
      positions,
      segments,

      color,
      width,
      depth,
      join,

      colors,
      widths,
      depths,
      ...rop,
    })
  );
};

