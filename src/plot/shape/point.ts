/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits/live';

import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { adjustSchema, schemaToArchetype, schemaToAttributes, toCPUDims, getTensorLength, getUniformDims } from '@use-gpu/core';
import { yeet, memo, useOne } from '@use-gpu/live';

import { useInspectHoverable, useTransformContext, POINT_SCHEMA, LayerReconciler } from '@use-gpu/workbench';

import { PointTraits } from '../traits';

const {quote} = LayerReconciler;

const useTraits = makeUseTrait(PointTraits);

export type PointProps = TraitProps<typeof PointTraits>;

export const Point: LiveComponent<PointProps> = memo((props) => {
  const parsed = useTraits(props);
  const {
      position,
      positions,
      color,
      colors,
      size,
      sizes,
      depth,
      depths,
      zIndex,
      zBias,
      zBiases,

      id,
      ids,
      lookup,
      lookups,

      formats,
      tensor,

      sources,
      ...flags
  } = parsed;

  if (zIndex && zBias == null) parsed.zBias = zIndex;

  const hovered = useInspectHoverable();
  if (hovered) flags.mode = "debug";

  const context = useTransformContext();
  const {transform, nonlinear, matrix: refs} = context;

  const schema = useOne(() => adjustSchema(POINT_SCHEMA, formats), formats);
  const attributes = schemaToAttributes(schema, parsed as any);
  const archetype = schemaToArchetype(schema, attributes, flags, refs, sources);

  const dims = toCPUDims(getUniformDims(schema.positions.format));
  const count = tensor ? getTensorLength(tensor) : positions ? (attributes.positions?.length / dims) || 0 : 1;

  // eslint-disable-next-line no-debugger
  if (Number.isNaN(count)) debugger;
  if (!count || !(position || positions)) return;

  const shapes = {
    point: {
      count,
      archetype,
      attributes,
      flags,
      refs,
      schema,
      sources,
      transform: nonlinear ?? context,
      zIndex,
    },
  };

  return quote(yeet(shapes));
}, shouldEqual({
  position: sameShallow(),
  color: sameShallow(),
}), 'Point');
