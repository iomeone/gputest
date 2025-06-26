import type { LC } from '@use-gpu/live';
import type { XYZ, XYZW } from '@use-gpu/core';

import { provide, use, useMemo, useState } from '@use-gpu/live';
import { seq, lerp } from '@use-gpu/core';

import { AxisHelper, TransformContext, useCombinedMatrixTransform, useMatrixContext, useViewContext, usePerFrame } from '@use-gpu/workbench';
import { Plot, Line, Arrow, Polygon, Point } from '@use-gpu/plot';

import { Cursor } from '../handlers/cursor';
import { Pick, PickState } from '../handlers/pick';

import {
  useDrag,
  lineConstraint, planeConstraint, circleConstraint,
  applyCartesianDrag, applyPolarDrag, applyScaleDrag,
  getDragFrame,
  ORTHO_AXES_XYZ,
} from '../drag/useDrag';

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
  onDrag: (b: boolean) => void,

  axis: number,
  visible: boolean,
};

export type GizmoRotateProps = GizmoAxisProps & {
  steps?: number,
};

const Z: XYZ = [0, 0, 0];

export const GizmoMatrix: LC<GizmoMatrixProps> = (props: GizmoMatrixProps) => {
  const {size = 0.1, move, rotate, scale, value, onChange} = props;

  const {uniforms} = useViewContext();
  const frameCount = usePerFrame();

  // Flip orientation relative to view
  const flipM = useMemo(() => {
    const v = vec3.clone(uniforms.viewPosition.current as vec3);
    const vm = uniforms.viewMatrix.current;

    const i = mat4.create();
    mat4.invert(i, value);
    vec3.transformMat4(v, v, i);

    const p = vec3.create();
    mat4.getTranslation(p, value);
    vec3.transformMat4(p, p, vm);
    const vz = -p[2];
    const s = size * vz;

    const x = Math.sign(v[0]) * s;
    const y = Math.sign(v[1]) * s;
    const z = Math.sign(v[2]) * s;

    return mat4.fromScaling(mat4.create(), [x, y, z]);
    // eslint-disable-next-line
  }, [uniforms, frameCount, value, size]);

  // Get world-space matrix
  const parent = useMatrixContext();
  const world = useMemo(() => {
    const m = mat4.create();
    const f = getDragFrame(value);

    if (parent) mat4.multiply(m, parent, f);
    else mat4.copy(m, f);

    mat4.multiply(m, m, flipM);

    return m;
  }, [parent, value, flipM]);

  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const makeOnDrag = (element: number) => (dragging: boolean) => {
    setDraggingElement(dragging ? element : null);
  };

  const isDragging = draggingElement != null;

  const moveX = move === true || (typeof move === 'string' && !!move?.match(/x/));
  const moveY = move === true || (typeof move === 'string' && !!move?.match(/y/));
  const moveZ = move === true || (typeof move === 'string' && !!move?.match(/z/));

  const moveXY = moveX && moveY;
  const moveYZ = moveY && moveZ;
  const moveZX = moveZ && moveX;

  const rotateX = rotate === true || (typeof rotate === 'string' && !!rotate?.match(/x/));
  const rotateY = rotate === true || (typeof rotate === 'string' && !!rotate?.match(/y/));
  const rotateZ = rotate === true || (typeof rotate === 'string' && !!rotate?.match(/z/));

  const scaleX = scale === true || (typeof scale === 'string' && !!scale?.match(/x/));
  const scaleY = scale === true || (typeof scale === 'string' && !!scale?.match(/y/));
  const scaleZ = scale === true || (typeof scale === 'string' && !!scale?.match(/z/));

  // Render gizmo
  const view = (
    use(Plot, {
      children: [
        draggingElement != null ? use(AxisHelper, {width: 3}) : null,
        draggingElement != null ? use(AxisHelper, {width: 3, opacity: 0.35, mode: 'transparent', depthTest: false}) : null,

        moveX ? use(GizmoAxis, {axis: 0, value, onChange, onDrag: makeOnDrag(0),  visible: !isDragging }) : null,
        moveY ? use(GizmoAxis, {axis: 1, value, onChange, onDrag: makeOnDrag(1),  visible: !isDragging }) : null,
        moveZ ? use(GizmoAxis, {axis: 2, value, onChange, onDrag: makeOnDrag(2),  visible: !isDragging }) : null,

        moveXY ? use(GizmoPlane, {axis: 0, value, onChange, onDrag: makeOnDrag(3),  visible: !isDragging }) : null,
        moveYZ ? use(GizmoPlane, {axis: 1, value, onChange, onDrag: makeOnDrag(4),  visible: !isDragging }) : null,
        moveZX ? use(GizmoPlane, {axis: 2, value, onChange, onDrag: makeOnDrag(5),  visible: !isDragging }) : null,

        rotateX ? use(GizmoRotate, {axis: 0, value, onChange, onDrag: makeOnDrag(6),  visible: !isDragging }) : null,
        rotateY ? use(GizmoRotate, {axis: 1, value, onChange, onDrag: makeOnDrag(7),  visible: !isDragging }) : null,
        rotateZ ? use(GizmoRotate, {axis: 2, value, onChange, onDrag: makeOnDrag(8),  visible: !isDragging }) : null,

        scaleX ? use(GizmoScale, {axis: 0, value, onChange, onDrag: makeOnDrag(9),  visible: !isDragging }) : null,
        scaleY ? use(GizmoScale, {axis: 1, value, onChange, onDrag: makeOnDrag(10), visible: !isDragging }) : null,
        scaleZ ? use(GizmoScale, {axis: 2, value, onChange, onDrag: makeOnDrag(11), visible: !isDragging }) : null,
      ],
    })
  );

  const [context] = useCombinedMatrixTransform(world);

  return provide(TransformContext, context, view);
};

export const GizmoAxis: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis, value, visible, onChange, onDrag} = props;

  const end = Z.slice() as XYZ;
  const color = [0.2, 0.2, 0.2];

  end[axis] = 1;
  color[axis] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const line = [Z, end];

  const handlers = useDrag(
    lineConstraint(line),
    applyCartesianDrag([axis]),
    value,
    onChange,
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}: PickState) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Arrow, {
          positions: line,
          color,
          width: hovered ? 10 : 5,
          end: true,
          zBias: 1,

          depthTest: false,
          depthWrite: false,
          mode: 'transparent'
        }),
        use(Line, {
          id,
          positions: line,
          color,
          width: 15,
          mode: 'picking',
          zBias: 1,
        }),
      ],
    })
  );
};

export const GizmoPlane: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis, value, visible, onChange, onDrag} = props;
  const axes = ORTHO_AXES_XYZ[axis];

  const a = Z.slice() as XYZ;
  const b = Z.slice() as XYZ;
  const c = Z.slice() as XYZ;

  const color = [0.2, 0.2, 0.2];
  for (const i of axes) color[i] = 1;
  for (const [j, i] of axes.entries()) {
    b[i] = 0.5;
    (j ? c : a)[i] = 0.5;
  }

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const plane: XYZW = [0, 0, 0, 0];
  plane[axis] = 1;

  const handlers = useDrag(
    planeConstraint(plane),
    applyCartesianDrag(axes),
    value,
    onChange,
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}: PickState) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Polygon, {
          positions: [Z, a, b, c],
          width: 2,
          stroke: [...color, hovered ? 1 : 0.5],
          fill: [...color, hovered ? 0.5 : 0.25],

          depthTest: false,
          depthWrite: false,
          mode: 'transparent'
        }),
        use(Polygon, {
          id,
          positions: [Z, a, b, c],
          width: 2,
          stroke: [...color, hovered ? 1 : 0.5],
          fill: [...color, hovered ? 0.5 : 0.25],
          mode: 'picking',
        }),
      ],
    })
  );
};

export const GizmoRotate: LC<GizmoRotateProps> = (props: GizmoRotateProps) => {
  const {axis, value, visible, steps = 16, onChange, onDrag} = props;
  const axes = ORTHO_AXES_XYZ[axis];

  const arc = useMemo(() => {
    return seq(steps + 1).map(i => {
      const th = lerp(i / steps * Math.PI / 2, Math.PI / 4, 0.2);
      const p = Z.slice() as XYZW;

      p[axes[0]] = Math.cos(th) * 0.85;
      p[axes[1]] = Math.sin(th) * 0.85;
      return p;
    });
  }, [axes, steps]);

  const color = [0.2, 0.2, 0.2];
  for (const i of axes) color[i] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const plane: XYZW = [0, 0, 0, 0];
  plane[axis] = 1;

  const handlers = useDrag(
    circleConstraint(plane, [0, 0, 0], 0.5),
    applyPolarDrag(axis),
    value,
    onChange,
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}: PickState) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Line, {
          positions: arc,
          color,
          width: hovered ? 15 : 10,

          depthTest: false,
          depthWrite: false,
          mode: 'transparent'
        }),
        use(Line, {
          id,
          positions: arc,
          color,
          width: 20,
          mode: 'picking',
        }),
      ],
    })
  );
};

export const GizmoScale: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis, value, visible, onChange, onDrag} = props;

  const end = Z.slice() as XYZ;
  const color = [0.2, 0.2, 0.2];

  end[axis] = 1;
  color[axis] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const line = [Z, end];

  const handlers = useDrag(
    lineConstraint(line),
    applyScaleDrag([axis]),
    value,
    onChange,
    onDrag,
  );

  return (
    use(Pick, {
      ...handlers,
      render: ({id, hovered}: PickState) => visible && [
        hovered ? use(Cursor, {cursor: 'pointer'}) : null,
        use(Point, {
          position: end,
          color,
          size: hovered ? 20 : 10,
          zBias: 2,

          depthTest: false,
          depthWrite: false,
          mode: 'transparent'
        }),
        use(Point, {
          id,
          position: end,
          color,
          size: 30,
          zBias: 3,
          mode: 'picking',
        }),
      ],
    })
  );
};
