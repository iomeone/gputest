/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '../../live';
import type { ShaderSource } from '../../shader';
import type { TensorArray } from '../../core';
import type { TraitProps } from '../../traits';

import { memo, use, useOne, useMemo, useRef } from '../../live';
import { makeUseTrait, shouldEqual, sameShallow } from '../../traits/index-live';
import { adjustSchema } from '../../core';
import { Data, SurfaceLayer, SURFACE_SCHEMA } from '../../workbench';

import { SurfaceTraits } from '../traits';

const useTraits = makeUseTrait(SurfaceTraits);

export type SurfaceProps = TraitProps<typeof SurfaceTraits>;

export const Surface: LiveComponent<SurfaceProps> = memo((props) => {
  const parsed = useTraits(props);
  const {
    positions,
    color,
    colors,
    zIndex,
    zBias,
    zBiases,

    id,
    ids,
    lookup,
    lookups,

    size,
    tensor,
    formats,

    sources: extra,
    ...flags
  } = parsed;

  const z = (zIndex && zBias == null) ? zIndex : zBias;
  const t = size ?? tensor ?? (props.positions as TensorArray)?.size;

  const s = useRef(t);
  s.current = t;

  const schema = useOne(() => adjustSchema(SURFACE_SCHEMA, formats), formats);

  return use(Data, {
    schema,
    data: {...parsed},
    tensor: t,
    render: (sources: Record<string, ShaderSource>) => useMemo(() => use(SurfaceLayer, {
      size: s,
      color,
      zBias: z,
      id,
      lookup,
      ...sources,
      ...extra,
      ...flags,
    }), [color, z, id, lookup, sources, extra, props]),
  });
}, shouldEqual({
  color: sameShallow(),
}), 'Surface');
