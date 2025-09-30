import type { LiveComponent } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { TensorArray } from '@use-gpu/core';
import type { TraitProps } from '@use-gpu/traits';

import { memo, use, useOne } from '@use-gpu/live';
import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { adjustSchema } from '@use-gpu/core';
import { useInspectHoverable, Data, DualContourLayer, DUAL_CONTOUR_SCHEMA } from '@use-gpu/workbench';

import { useRangeContext, useNoRangeContext } from '../providers/range-provider';
import { ImplicitSurfaceTraits } from '../traits';

const useTraits = makeUseTrait(ImplicitSurfaceTraits);

export type ImplicitSurfaceProps = TraitProps<typeof ImplicitSurfaceTraits>;

export const ImplicitSurface: LiveComponent<ImplicitSurfaceProps> = memo((props: ImplicitSurfaceProps) => {
  const parsed = useTraits(props);

  const {
    values,
    normals,

    range,
    size,

    formats,
    tensor,

    zBias,
    zIndex,

    sources: extra,
    ...flags
  } = parsed;

  const z = (zIndex && zBias == null) ? zIndex : zBias;

  const hovered = useInspectHoverable();
  if (hovered) flags.mode = "debug";

  const schema = useOne(() => adjustSchema(DUAL_CONTOUR_SCHEMA, formats), formats);

  const r = range ? (useNoRangeContext(), range) : useRangeContext();

  return use(Data, {
    schema,
    data: {values, normals},
    tensor: size ?? tensor ?? (props.values as TensorArray)?.size,
    render: (sources: Record<string, ShaderSource>) => use(DualContourLayer, {
      range: r,
      zBias: z,
      ...sources,
      ...extra,
      ...flags,
    }),
  });
}, shouldEqual({
  color: sameShallow(),
}), 'ImplicitSurface');
