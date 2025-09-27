import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { AnchorTrait, ColorTrait, FontTrait, LabelTrait, ROPTrait, VectorLike } from '../types';

import { use, provide, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';
import { mapChunksToSegments, mapChunksToAnchors } from '@use-gpu/core';
import { diffBy } from '@use-gpu/shader/wgsl';
import { DataContext, ValuesContext } from '../../providers/data-provider';
import { RangeContext } from '../../providers/range-provider';
import {
  parseFloat,
  parseDetail,
  parsePosition4,
} from '../util/parse';
import {
  useAnchorTrait,
  useColorTrait,
  useFontTrait,
  useLabelTrait,
  useROPTrait,
} from '../traits';
import { formatNumber } from '../util/format';
import { vec4 } from 'gl-matrix';

import { LabelLayer } from '../../layers/label-layer';

export type LabelProps =
  Partial<AnchorTrait> &
  Partial<ColorTrait> &
  Partial<FontTrait> &
  Partial<LabelTrait> &
  Partial<ROPTrait>;

const DENSITY_BINDING = [{ name: 'getDensity', type: 'vec4<f32>', value: [0, 0, 0, 0] }];

export const Label: LiveComponent<LabelProps> = (props) => {

  const positions = useContext(DataContext);
  const values = useContext(ValuesContext);

  const count = useCallback(() => positions.length, [positions]);

  const {family, weight, style} = useFontTrait(props);
  const {labels, format, size, depth, expand} = useLabelTrait(props);
  const {placement, flip, offset} = useAnchorTrait(props);
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
      flip,
      offset,
      count,
      size,
      depth,
      color,
      expand,
    })
  );
};

