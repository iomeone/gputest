/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '../../live';
import type { TensorArray, VectorLike, UniformAttribute } from '../../core';
import type { TraitProps } from '../../traits';
import type { ShaderSource } from '../../shader';

import { makeUseTrait, useProp } from '../../traits/index-live';
import { parseNumber, parseVec4, parseIntegerPositive } from '../../parse';
import { use, useCallback, useOne, useMemo } from '../../live';
import { adjustSchema } from '../../core';
import { diffBy } from '../../shader/wgsl';
import { Data, TickLayer, TICK_SCHEMA, useSource } from '../../workbench';

import { vec4 } from 'gl-matrix';

import { TickTraits } from '../traits';

const useTraits = makeUseTrait(TickTraits);

export type TickProps = TraitProps<typeof TickTraits> & {
  base?: number,
  size?: number,
  detail?: number,
  offset?: VectorLike,
};

const NO_OFFSET = vec4.fromValues(0, 1, 0, 0);
const GET_POSITION = {format: 'vec4<f32>', name: 'getPosition'} as UniformAttribute;
const GET_SIZE = {format: 'u32', name: 'getSize', args: []} as UniformAttribute;

export const Tick: LiveComponent<TickProps> = (props) => {
  const {
    size = 5,
    detail = 1,
    base = 10,
    offset = NO_OFFSET
  } = props;

  const parsed = useTraits(props);
  const {
    position,
    positions,
    tangent,
    tangents,
    color,
    colors,
    width,
    widths,
    depth,
    depths,
    zIndex,
    zBias,
    zBiases,

    id,
    ids,
    lookup,
    lookups,

    tensor,
    formats,

    sources: extra,
    ...flags
  } = parsed;

  const z = (zIndex && zBias == null) ? zIndex : zBias;

  const schema = useOne(() => adjustSchema(TICK_SCHEMA, formats), formats);

  const s = useProp(size, parseNumber);
  const d = useProp(detail, parseIntegerPositive);
  const o = useProp(offset, parseVec4);

  return use(Data, {
    schema,
    data: {...parsed},
    tensor: tensor ?? (props.positions as TensorArray)?.size,
    render: (sources: Record<string, ShaderSource>) => {
      const {positions, tangents} = sources;
      const count = useCallback(() => (positions as any)?.length, [positions]);
      
      const getPosition = useSource(GET_POSITION, positions);
      const getSize = useSource(GET_SIZE, count);
      const resolvedTangents = useMemo(
        () => tangents ?? diffBy(getPosition, [-1], getSize),
        [tangents, getPosition, getSize]
      );

      return useMemo(() => use(TickLayer, {
        size: s,
        offset: o,
        detail: d,
        tangents: resolvedTangents,
        width,
        depth,
        zBias: z,
        id,
        lookup,
        base,
        ...sources,
        ...extra,
        ...flags,
      }), [color, tangent, width, depth, z, id, lookup, base, sources, extra, props]);
    }
  });
};

