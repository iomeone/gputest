import type { LiveComponent } from '../../live';
import type { ShaderSource } from '../../shader';
import type { VectorLike } from '../../traits';
import type { ColorTrait, LineTrait, ROPTrait } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '../../live';
import { bundleToAttribute } from '../../shader/wgsl';

import { useBoundShader, LineLayer } from '../../workbench';
import { DataContext } from '../providers/data-provider';
import {
  useColorTrait,
  useLineTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { getLineSegment } from '../../wgsl/geometry/segmentwgsl';

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

