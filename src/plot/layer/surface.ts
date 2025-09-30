/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { TensorArray } from '@use-gpu/core';
import type { TraitProps } from '@use-gpu/traits';

import { memo, use, useOne, useMemo, useRef } from '@use-gpu/live';
import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { adjustSchema } from '@use-gpu/core';
import { Data, SurfaceLayer, SURFACE_SCHEMA } from '@use-gpu/workbench';

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
