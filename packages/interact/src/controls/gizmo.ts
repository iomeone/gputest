import type { LC } from '@use-gpu/live';

import { provide, use, useMemo } from '@use-gpu/live';

import { AxisHelper, PlaneHelper, TransformContext, useCombinedMatrixTransform, useMatrixContext } from '@use-gpu/workbench';
import { Pick, Cursor } from '@use-gpu/interact';

import { mat4 } from 'gl-matrix';

export type GizmoMatrixProps = {
  value: mat4,

  size?: number,
  
  move?: boolean | string,
  rotate?: boolean | string,
  scale?: boolean | string,

  onChange: (m: mat4) => void,
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

  const view = [
    use(Pick, {
      render: ({id, hovered}) => [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(PlaneHelper, {size: size / 2, zBias: 1, opacity: 0.5, mode: 'transparent'}),
        use(PlaneHelper, {id, size: size / 2, zBias: 1, mode: 'picking', depthTest: false}),
      ],
    }),
    use(Pick, {
      render: ({id, hovered}) => [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(AxisHelper, {size, width: 5, zBias: 2}),
        use(AxisHelper, {id, size, width: 15, zBias: 2, mode: 'picking'}),
      ],
    }),
  ];

  const [context, combined] = useCombinedMatrixTransform(world);
  return provide(TransformContext, context, view);
};
