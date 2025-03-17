import type { LiveComponent } from '@use-gpu/live';
import type { TensorArray, UniformType } from '@use-gpu/core';
import type { TraitProps } from '@use-gpu/traits';

import { memo, use } from '@use-gpu/live';
import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { useRawTensorSource, useNoRawTensorSource, useInspectHoverable, DualContourLayer } from '@use-gpu/workbench';

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

  const r = range ? (useNoRangeContext(), range) : useRangeContext();
  const s = size ?? tensor ?? (props.values as TensorArray)?.size;

  // Avoid copy here because volume data is big and we never aggregate it
  const vs = values && formats?.values ? useRawTensorSource({
    array: values,
    format: formats.values as UniformType,
    size: s,

    dims: -1, // unused
    length: -1, // unused
    version: 0,
  }, { live: true }) : useNoRawTensorSource();

  const ns = normals && formats?.normals ? useRawTensorSource({
    array: normals,
    format: formats.normals as UniformType,
    size: s,

    dims: -1, // unused
    length: -1, // unused
    version: 0,
  }, { live: true }) : useNoRawTensorSource();

  return use(DualContourLayer, {
    range: r,
    zBias: z,
    values: vs,
    normals: ns,
    ...extra,
    ...flags,
  });

  /*
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
  }
  */
}, shouldEqual({
  color: sameShallow(),
}), 'ImplicitSurface');
