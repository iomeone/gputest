/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LiveComponent } from '../../live';
import type { VectorLike } from '../../core';
import type { TraitProps } from '../../traits';

import { makeUseTrait, shouldEqual, sameShallow } from '../../traits/live';
import { adjustSchema, schemaToArchetype, schemaToEmitters, toCPUDims, getUniformDims } from '../../core';
import { yeet, memo, useContext, useOne, useMemo } from '../../live';
import { formatNumber } from '../util/format';

import { useShaderRef, useInspectHoverable, useTransformContext, LABEL_SCHEMA, LayoutContext, LayerReconciler } from '../../workbench';

import { LabelTraits } from '../traits';

const {quote} = LayerReconciler;

const useTraits = makeUseTrait(LabelTraits);

export type LabelProps = TraitProps<typeof LabelTraits>;

const toArrayMap = <T>(xs: VectorLike, map: (x: number) => T) => {
  const out = [];
  for (const x of xs) out.push(map(x));
  return out;
};

export const Label: LiveComponent<LabelProps> = memo((props) => {
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

    label,
    labels,
    precision = 3,
    formatter,
    values,

    id,
    ids,
    lookup,
    lookups,

    tensor,
    formats,

    sources,
    ...flags
  } = parsed;

  const z = (zIndex && zBias == null) ? zIndex : zBias;

  // Label Y flip
  const layout = useContext(LayoutContext);
  const flip = [1, 1];
  if (layout[2] < layout[0]) flip[0] = -1;
  if (layout[3] < layout[1]) flip[1] = -1;
  //(flags as any).flip = flip;

  // Resolve label strings
  const resolvedFormatter = useMemo(() => formatter ?? ((x: number) => formatNumber(x, precision)), [formatter, precision]);
  const resolvedLabels = labels != null ? (
    useMemo(() => labels ?? [label], [labels, label])
  ) : (
    useMemo(() => values ? toArrayMap(values, resolvedFormatter) : [], [values, resolvedFormatter])
  );

  const hovered = useInspectHoverable();
  if (hovered) flags.mode = "debug";

  const context = useTransformContext();
  const {transform, nonlinear, matrix: refs} = context;

  const l = useShaderRef(resolvedLabels);
  const resolvedRefs = useMemo(() => ({...refs, labels: l}), [refs, l]);

  const schema = useOne(() => adjustSchema(LABEL_SCHEMA, formats), formats);
  const attributes = schemaToEmitters(schema, {...parsed as any, labels: resolvedLabels});
  const archetype = schemaToArchetype(schema, attributes, flags, resolvedRefs, sources);

  const dims = toCPUDims(getUniformDims(schema.positions.format));
  const count = positions ? (attributes.positions?.length / dims) || 0 : 1;

  // eslint-disable-next-line no-debugger
  if (Number.isNaN(count)) debugger;
  if (!count || !(position || positions)) return;

  const shapes = {
    label: {
      count,
      archetype,
      attributes,
      flags,
      refs,
      schema,
      sources,
      transform: nonlinear ?? (context.key ? context : undefined),
      zIndex,
    },
  };

  return quote(yeet(shapes));
}, shouldEqual({
  position: sameShallow(),
  color: sameShallow(),
}), 'Label');
