import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { CPUGeometry } from '@use-gpu/core';

import { memo, yeet, useOne } from '@use-gpu/live';
import { formatToArchetype } from '@use-gpu/core';
import { patch } from '@use-gpu/state';

import { transformPositions, transformNormals, useMatrixContext } from '@use-gpu/workbench';

export type GeometryProps = PropsWithChildren<CPUGeometry>;

export const Geometry: LiveComponent<GeometryProps> = memo((props: GeometryProps) => {
  const {count, attributes, formats, children} = props;

  const matrix = useMatrixContext();
  if (!matrix) return children;

  return useOne(() => {
    const {positions, normals} = attributes;
    const ps = transformPositions(positions, formats.positions, matrix);
    const ns = transformNormals(normals, formats.normals, matrix);

    const attr = patch(attributes, {positions: ps, normals: ns});
    const fmts = patch(formats, {positions: 'vec4<f32>', normals: 'vec4<f32>'});
    const archetype = formatToArchetype(fmts);

    return yeet({
      count,
      attributes: attr,
      formats: fmts,
      archetype,
    });
  }, matrix);
}, 'Geometry');

