/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';

import { makeUseTrait, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { adjustSchema, schemaToArchetype, schemaToEmitters } from '@use-gpu/core';
import { yeet, memo, useOne } from '@use-gpu/live';

import { useInspectHoverable, useTransformContext, useScissorContext, FACE_SCHEMA, LayerReconciler } from '@use-gpu/workbench';

import { FaceTraits } from '../traits';

const {quote} = LayerReconciler;

const useTraits = makeUseTrait(FaceTraits);

export type FaceProps = TraitProps<typeof FaceTraits>;

export const InnerFace: LiveComponent<FaceProps> = (props) => {

  const parsed = useTraits(props);
  const {
      positions,
      color,
      colors,
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
      indexed,
      chunks,
      groups,
      concave,

      schema: _,
      formats,
      tensor,

      segments,
      indices,
      slices,

      sources,
      ...flags
  } = parsed;

  if (zIndex && zBias == null) parsed.zBias = zIndex;

  const hovered = useInspectHoverable();
  if (hovered) flags.mode = "debug";

  const scissor = useScissorContext();
  const context = useTransformContext();
  const {transform, nonlinear, matrix: refs} = context;

  const schema = useOne(() => adjustSchema(FACE_SCHEMA, formats), formats);
  const attributes = schemaToEmitters(schema, parsed as any);
  const archetype = schemaToArchetype(schema, attributes, flags, refs, sources);

  // eslint-disable-next-line no-debugger
  if (Number.isNaN(count)) debugger;
  if (!count || !positions) return;

  const shapes = {
    face: {
      count,
      indexed,
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
};

export const Face = memo(InnerFace, shouldEqual({
  position: sameShallow(sameShallow()),
  color: sameShallow(),
}), 'Face');

