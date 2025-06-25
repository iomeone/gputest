import type { LC } from '@use-gpu/live';

import { provide, use, useMemo } from '@use-gpu/live';

import { AxisHelper, PlaneHelper, TransformContext, useCombinedMatrixTransform, useMatrixContext } from '@use-gpu/workbench';
import { Pick, Cursor } from '@use-gpu/interact';
import { Plot, Line, Arrow } from '@use-gpu/plot';

import { mat4 } from 'gl-matrix';

export type GizmoMatrixProps = {
  value: mat4,

  size?: number,
  
  move?: boolean | string,
  rotate?: boolean | string,
  scale?: boolean | string,

  onChange: (m: mat4) => void,
};

export type GizmoAxisProps = {
  axis: number,
};

export const GizmoMatrix: LC<GizmoMatrixProps> = (props: GizmoMatrixProps) => {
  const {size = 1, value, onChange} = props;

  const parent = useMatrixContext();

  const world = useMemo(() => {
    const m = mat4.create();

    if (parent) mat4.multiply(m, parent, value);
    else mat4.copy(m, value);

    return m;
  }, [parent, value]);

  const view = (
    use(Plot, {
      children: [
        use(GizmoAxis, {axis: 0}),
        use(GizmoAxis, {axis: 1}),
        use(GizmoAxis, {axis: 2}),
      ],
    })
  );

  const [context, combined] = useCombinedMatrixTransform(world);
  return provide(TransformContext, context, view);
};

export const GizmoAxis: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis} = props;

  const end = [0, 0, 0];
  const color = [0.1, 0.1, 0.1];

  end[axis] = 1;
  color[axis] = 1;

  return (
    use(Pick, {
      render: ({id, hovered}) => [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Arrow, {positions: [[0, 0, 0], end], color, width: 5, end: true}),
        //use(Line, {id, positions: [[0, 0, 0], end], color, width: 15, mode: 'picking'}),
      ],
    })
  );
};
