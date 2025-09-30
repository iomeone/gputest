import type { LiveComponent, PropsWithChildren } from '../live';
import type { CPUGeometry } from '../core';

import { memo, yeet, useOne } from '../live';
import { formatToArchetype } from '../core';
import { patch } from '../state';

import { transformPositions, transformNormals, useMatrixContext } from '../workbench';

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

