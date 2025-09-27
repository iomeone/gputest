import type { LiveComponent } from '../../live';
import type { ShaderSource } from '../../shader';
import type { VectorLike } from '../../traits';
import type { ArrowTrait, ColorTrait, LineTrait, ROPTrait } from '../types';

import { useProp, parsePosition4 } from '../../traits';
import { useBoundShader, useBoundSource, useLambdaSource, useShaderRef, ArrowLayer } from '../../workbench';
import { use, provide, useCallback, useContext, useOne, useMemo } from '../../live';
import { bundleToAttributes } from '../../shader/wgsl';

import { DataContext } from '../providers/data-provider';
import {
  useArrowTrait,
  useColorTrait,
  useLineTrait,
  useROPTrait,
} from '../traits';
import { vec4 } from 'gl-matrix';

import { getLineSegment } from '../../wgsl/geometry/segment.wgsl';
import { getLineAnchor } from '../../wgsl/geometry/anchor.wgsl';
import { getLineTrim } from '../../wgsl/geometry/trim.wgsl';

const LINE_ATTRIBUTES = bundleToAttributes(getLineSegment);
const ARROW_ATTRIBUTES = bundleToAttributes(getLineAnchor);
const [, START_ATTRIBUTE, END_ATTRIBUTE] = ARROW_ATTRIBUTES;

export type ArrowProps =
  Partial<ArrowTrait> &
  Partial<ColorTrait> &
  Partial<LineTrait> &
  Partial<ROPTrait> & {

  colors?: ShaderSource,
  widths?: ShaderSource,
  depths?: ShaderSource,
};

export const Arrow: LiveComponent<ArrowProps> = (props) => {
  const {colors, widths, depths} = props;

  const positions = useContext(DataContext) ?? undefined;

  const {size, start, end, detail} = useArrowTrait(props);
  const {width, depth, join} = useLineTrait(props);
  const color = useColorTrait(props);
  const {zBias} = useROPTrait(props);

  const detailExpr = useOne(() => () => ((positions as any)?.size?.[0] || 1) - 1, positions);
  const countExpr = useOne(() => () => ((positions as any)?.length || 0) * (+start + +end) / 2, positions);

  const boundStart = useBoundSource(START_ATTRIBUTE, useShaderRef(+start));
  const boundEnd = useBoundSource(END_ATTRIBUTE, useShaderRef(+end));
  const deps = [detailExpr, boundStart, boundEnd];

  const segments = useOne(() => useBoundShader(getLineSegment, LINE_ATTRIBUTES, [detailExpr]), detailExpr);
  const anchors = useMemo(() => useBoundShader(getLineAnchor, ARROW_ATTRIBUTES, [detailExpr, boundStart, boundEnd]), deps);
  const trims = useMemo(() => useBoundShader(getLineTrim, ARROW_ATTRIBUTES, [detailExpr, boundStart, boundEnd]), deps);

  return (
    use(ArrowLayer, {
      positions,
      segments,
      anchors,
      trims,

      color,
      width,
      depth,
      join,
      detail,
      zBias,

      colors,
      widths,
      depths,
      
      count: countExpr,
    })
  );
};

