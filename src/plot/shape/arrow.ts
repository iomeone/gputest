/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';

import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { adjustSchema, schemaToArchetype, schemaToEmitters } from '@use-gpu/core';
import { yeet, memo, useOne } from '@use-gpu/live';

import { useInspectHoverable, useTransformContext, useScissorContext, ARROW_SCHEMA, LayerReconciler } from '@use-gpu/workbench';

import { ArrowTraits } from '../traits';

const {quote} = LayerReconciler;

const useTraits = makeUseTrait(ArrowTraits);

export type ArrowProps = TraitProps<typeof ArrowTraits>;

export const Arrow: LiveComponent<ArrowProps> = memo((props) => {

  const parsed = useTraits(props);
  const {
      positions,
      color,
      colors,
      width,
      widths,
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

      count,
      sparse,
      chunks,
      groups,
      loop,
      loops,
      start,
      starts,
      end,
      ends,

      schema: _,
      formats,
      tensor,

      segments,
      slices,
      anchors,
      trims,
      unwelds,

      sources,
      ...flags
  } = parsed;

  if (zIndex && zBias == null) parsed.zBias = zIndex;

  const hovered = useInspectHoverable();
  if (hovered) flags.mode = "debug";

  const scissor = useScissorContext();
  const context = useTransformContext();
  const {transform, nonlinear, matrix: refs} = context;

  const schema = useOne(() => adjustSchema(ARROW_SCHEMA, formats), formats);
  const attributes = schemaToEmitters(schema, parsed as any);
  const archetype = schemaToArchetype(schema, attributes, flags, refs, sources);

  // eslint-disable-next-line no-debugger
  if (Number.isNaN(count)) debugger;
  if (!count || !positions) return;

  const shapes = {
    arrow: {
      count,
      archetype,
      attributes,
      flags,
      refs,
      schema,
      scissor,
      sources,
      transform: nonlinear ?? context,
      zIndex,
    },
  };

  return quote(yeet(shapes));
}, shouldEqual({
  position: sameShallow(sameShallow()),
  color: sameShallow(),
}), 'Arrow');

