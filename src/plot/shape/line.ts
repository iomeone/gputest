/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '../../live';
import type { TraitProps } from '../../traits/index-live';

import { makeUseTrait, shouldEqual, sameShallow } from '../../traits/index-live';
import { schemaToArchetype, schemaToEmitters, adjustSchema } from '../../core';
import { yeet, memo, useOne } from '../../live';

import { useInspectHoverable, useTransformContext, useScissorContext, LINE_SCHEMA, LayerReconciler } from '../../workbench';

import { LineTraits } from '../traits';

const {quote} = LayerReconciler;

const useTraits = makeUseTrait(LineTraits);

export type LineProps = TraitProps<typeof LineTraits>;

export const InnerLine: LiveComponent<LineProps> = (props) => {
  const parsed = useTraits(props);
  const {
      positions,
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

      count,
      chunks,
      groups,
      loop,
      loops,

      schema: _,
      formats,
      tensor,

      segments,
      slices,
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

  const schema = useOne(() => adjustSchema(LINE_SCHEMA, formats), formats);
  const attributes = schemaToEmitters(schema, parsed as any);
  const archetype = schemaToArchetype(schema, attributes, flags, refs, sources);

  // eslint-disable-next-line no-debugger
  if (Number.isNaN(count)) debugger;
  if (!count || !positions) return;

  const shapes = {
    line: {
      count,
      archetype,
      attributes,
      flags,
      refs,
      schema: formats ? schema : undefined,
      scissor,
      sources,
      transform: nonlinear ?? context,
      zIndex,
    },
  };
  return quote(yeet(shapes));
};

export const Line = memo(InnerLine, shouldEqual({
  position: sameShallow(sameShallow()),
  color: sameShallow(),
}), 'Line');
