import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/traits';
import type { AnchorTrait, ColorTrait, FontTrait, LabelTrait, ROPTrait } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';
import { DataContext, ValuesContext } from '../providers/data-provider';
import { RangeContext } from '../providers/range-provider';
import { LayoutContext, LabelLayer } from '@use-gpu/workbench';
import {
  useAnchorTrait,
  useColorTrait,
  useFontTrait,
  useLabelTrait,
  useROPTrait,
} from '../traits';
import { formatNumber } from '../util/format';
import { vec4 } from 'gl-matrix';

export type LabelProps =
  Partial<AnchorTrait> &
  Partial<ColorTrait> &
  Partial<FontTrait> &
  Partial<LabelTrait> &
  Partial<ROPTrait>;

const DENSITY_BINDING = [{ name: 'getDensity', type: 'vec4<f32>', value: [0, 0, 0, 0] }];

export const Label: LiveComponent<LabelProps> = (props) => {

  const positions = useContext(DataContext) ?? undefined;
  const values = useContext(ValuesContext);
  const layout = useContext(LayoutContext);

  const flip = [1, 1];
  if (layout[2] < layout[0]) flip[0] = -1;
  if (layout[3] < layout[1]) flip[1] = -1;

  const count = useCallback(() => (positions as any)?.length || 0, [positions]);

  const {family, weight, style} = useFontTrait(props);
  const {labels, format, size, depth, expand} = useLabelTrait(props);
  const {placement, offset} = useAnchorTrait(props);

  const color = useColorTrait(props);
  const rop = useROPTrait(props);

  const strings = useMemo(() => {
    if (labels) return labels;
    if (values) {
      let v = values;
      if (!Array.isArray(v)) v = Array.from(v);
      if (format) return v.map(format);
      return v.map(v => formatNumber(v, 3));
    }
    return [];
  }, [labels, values, format])

  return (
    use(LabelLayer, {
      labels: strings,
      family,
      weight,
      style,

      positions,
      placement,
      offset,
      count,
      size,
      depth,
      color,
      expand,
      flip,
    })
  );
};

