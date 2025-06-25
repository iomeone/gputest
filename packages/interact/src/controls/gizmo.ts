import type { LC } from '@use-gpu/live';
import type { XYZ } from '@use-gpu/core';

import { provide, use, useMemo, useOne, useState } from '@use-gpu/live';
import { seq, lerp } from '@use-gpu/core';

import { AxisHelper, PlaneHelper, TransformContext, useCombinedMatrixTransform, useMatrixContext, useViewContext, usePerFrame } from '@use-gpu/workbench';
import { Pick, Cursor } from '@use-gpu/interact';
import { Plot, Line, Arrow, Face } from '@use-gpu/plot';

import { useLineDrag, usePlaneDrag } from '../drag/useDrag';

import { mat4, vec3 } from 'gl-matrix';

export type GizmoMatrixProps = {
  value: mat4,
  onChange: (m: mat4) => void,

  size?: number,

  move?: boolean | string,
  rotate?: boolean | string,
  scale?: boolean | string,
};

export type GizmoAxisProps = {
  value: mat4,
  onChange: (m: mat4) => void,

  axis: number,
};

export type GizmoPlaneProps = {
  value: mat4,
  onChange: (m: mat4) => void,

  axis: number,
};

export type GizmoRotateProps = {
  value: mat4,
  onChange: (m: mat4) => void,

  axis: number,
};

const Z = [0, 0, 0];

enum GizmoElement {
  MoveX = 1,
  MoveY = 2,
  MoveZ = 3,

  MoveXY = 4,
  MoveYZ = 5,
  MoveZX = 6,

  RotateX = 7,
  RotateY = 8,
  RotateZ = 9,

  ScaleX = 10,
  ScaleY = 11,
  ScaleZ = 12,
};

export const GizmoMatrix: LC<GizmoMatrixProps> = (props: GizmoMatrixProps) => {
  const {size = 1, value, onChange} = props;

  const {uniforms} = useViewContext();
  const frame = usePerFrame();

  // Flip orientation relative to view
  const flipM = useMemo(() => {
    const viewPos = uniforms.viewPosition.current;

    const v = vec3.create();
    mat4.getTranslation(v, value);

    vec3.sub(v, viewPos, v);

    const x = Math.sign(v[0]);
    const y = Math.sign(v[1]);
    const z = Math.sign(v[2]);

    return mat4.fromScaling(mat4.create(), [x, y, z]);
  }, [uniforms, frame, value]);

  // Get world-space matrix
  const parent = useMatrixContext();
  const world = useMemo(() => {
    const m = mat4.create();

    if (parent) mat4.multiply(m, parent, value);
    else mat4.copy(m, value);

    mat4.multiply(m, m, flipM);

    return m;
  }, [parent, value, flipM]);

  const [draggingElement, setDraggingElement] = useState<number>(null);
  const makeOnDrag = (element: number) => (dragging: boolean) => {
    setDraggingElement(dragging ? element : null);
  };
  
  const shouldShow = (element: number) => draggingElement == null || draggingElement == element;

  // Render gizmo
  const view = (
    use(Plot, {
      children: [
        use(GizmoAxis, {axis: 0, value, onChange, onDrag: makeOnDrag(0), visible: shouldShow(0) }),
        use(GizmoAxis, {axis: 1, value, onChange, onDrag: makeOnDrag(1), visible: shouldShow(1) }),
        use(GizmoAxis, {axis: 2, value, onChange, onDrag: makeOnDrag(2), visible: shouldShow(2) }),
        use(GizmoPlane, {axis: 0, value, onChange, onDrag: makeOnDrag(3), visible: shouldShow(3) }),
        use(GizmoPlane, {axis: 1, value, onChange, onDrag: makeOnDrag(4), visible: shouldShow(4) }),
        use(GizmoPlane, {axis: 2, value, onChange, onDrag: makeOnDrag(5), visible: shouldShow(5) }),
        use(GizmoRotate, {axis: 0, axes: [1, 2], value, onChange, onDrag: makeOnDrag(6), visible: shouldShow(6) }),
        use(GizmoRotate, {axis: 1, axes: [2, 0], value, onChange, onDrag: makeOnDrag(7), visible: shouldShow(7) }),
        use(GizmoRotate, {axis: 2, axes: [0, 1], value, onChange, onDrag: makeOnDrag(8), visible: shouldShow(8) }),
      ],
    })
  );

  const [context, combined] = useCombinedMatrixTransform(world);

  return provide(TransformContext, context, view);
};

export const GizmoAxis: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis, value, visible, onChange, onDrag} = props;

  const end = Z.slice();
  const color = [0.2, 0.2, 0.2];

  end[axis] = 1;
  color[axis] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .2;

  const line = [Z, end];

  const handlers = useLineDrag(
    line,
    () => {
      const v = vec3.create();
      mat4.getTranslation(v, value);
      return v;
    },
    (moved: XYZ) => {
      const v = mat4.clone(value);
      v[12 + axis] = moved[axis];
      onChange(v);
    },
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Arrow, {positions: line, color, width: hovered ? 10 : 5, end: true, zBias: 1}),
        use(Line, {id, positions: line, color, width: 15, mode: 'picking', zBias: 1}),
      ],
    })
  );
};

export const GizmoPlane: LC<GizmoPlaneProps> = (props: GizmoPlaneProps) => {
  const {axis, value, visible, onChange, onDrag} = props;

  const axes = useOne(() => [0, 1, 2].filter(a => a != axis), axis);

  const a = Z.slice();
  const b = Z.slice();
  const c = Z.slice();

  const color = [0.2, 0.2, 0.2];
  for (const i of axes) color[i] = 1;
  for (const [j, i] of axes.entries()) {
    b[i] = 0.5;
    (j ? c : a)[i] = 0.5;
  }

  color[0] += color[2] * .2;
  color[1] += color[2] * .2;

  const plane = [0, 0, 0, 0];
  plane[axis] = 1;

  const handlers = usePlaneDrag(
    plane,
    () => {
      const v = vec3.create();
      mat4.getTranslation(v, value);
      return v;
    },
    (moved: XYZ) => {
      const v = mat4.clone(value);
      for (const i of axes) v[12 + i] = moved[i];
      onChange(v);
    },
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Face, {id, positions: [Z, a, b, c], color: [...color, hovered ? 1 : 0.5]}),
      ],
    })
  );
};

export const GizmoRotate: LC<GizmoRotateProps> = (props: GizmoRotateProps) => {
  const {axis, visible, steps = 16} = props;

  const axes = useOne(() => [0, 1, 2].filter(a => a != axis), axis);

  const arc = useMemo(() => {
    return seq(steps + 1).map(i => {
      const th = lerp(i / steps * Math.PI / 2, Math.PI / 4, 0.2);
      const p = Z.slice();

      p[axes[0]] = Math.cos(th) * 0.85;
      p[axes[1]] = Math.sin(th) * 0.85;
      return p;
    });
  }, [axes]);

  const color = [0.2, 0.2, 0.2];
  for (const i of axes) color[i] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .2;

  return (
    use(Pick, {
      render: ({id, hovered}) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Line, {positions: arc, color, width: hovered ? 10 : 5}),
        use(Line, {id, positions: arc, color, width: 15, mode: 'picking'}),
      ],
    })
  );
};
