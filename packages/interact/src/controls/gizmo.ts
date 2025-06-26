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
  lineConstraint, planeConstraint, polarTangentConstraint,
  applyCartesianDrag, applyPolarDrag, applyScaleDrag,
  getDragFrame, getAbsoluteFrame,
  ORTHO_AXES_XYZ,
} from '../drag/useDrag';

import { mat4, vec3 } from 'gl-matrix';

export type GizmoMatrixProps = {
  value: mat4,
  onChange: (m: mat4) => void,

  size?: number,

  absolute?: boolean,
  nonUniform?: boolean,
  negative?: boolean,

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

  absolute?: boolean,

  xformUniform: mat4,
  xformNonUniform: mat4,
};

export type GizmoRotateProps = GizmoAxisProps & {
  steps?: number,
};

export type GizmoScaleProps = GizmoAxisProps & {
  negative?: boolean,
  nonUniform?: boolean,
};

const Z: XYZ = [0, 0, 0];

export const GizmoMatrix: LC<GizmoMatrixProps> = (props: GizmoMatrixProps) => {
  const {
    value,
    onChange,

    move,
    rotate,
    scale,

    absolute,
    negative,
    nonUniform = typeof scale === 'object',

    size = .1,
  } = props;
  
  const {uniforms} = useViewContext();
  const frameCount = usePerFrame();

  // Flip orientation relative to view
  const parent = useMatrixContext();
  const [flipM, frame, xformUniform, xformNonUniform] = useMemo(() => {
    const vm = uniforms.viewMatrix.current;

    // Distance of gizmo to view (for absolute size)
    const p = vec3.create();
    mat4.getTranslation(p, value);
    if (parent) vec3.transformMat4(p, p, parent);
    vec3.transformMat4(p, p, vm);

    const vz = -p[2];
    const s = size * vz;

    // Orientation flipping relative to view
    const v = vec3.clone(uniforms.viewPosition.current as vec3);
    const i = mat4.create();

    const fu = (absolute ? getAbsoluteFrame : getDragFrame)(value);
    const fnu = (absolute ? fu : value);

    const xfu = parent ? mat4.multiply(mat4.create(), parent, fu) : fu;
    const xfnu = parent ? mat4.multiply(mat4.create(), parent, fnu) : fnu;
    mat4.invert(i, xfu);
    vec3.transformMat4(v, v, i);

    const x = Math.sign(v[0]) * s;
    const y = Math.sign(v[1]) * s;
    const z = Math.sign(v[2]) * s;

    const flip = mat4.fromScaling(mat4.create(), [x, y, z]);
    return [flip, fu, xfu, xfnu];
    // eslint-disable-next-line
  }, [uniforms, frameCount, parent, value, size]);

  // Get local matrix for gizmo itself
  const local = useMemo(() => {
    const m = mat4.create();
    mat4.multiply(m, frame, flipM);
    return m;
  }, [frame, flipM]);

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
  const gizmoProps = (element: number) => ({
    axis: element % 3,
    absolute,
    negative,
    nonUniform,
    xformUniform,
    xformNonUniform,
    value,
    onChange,
    onDrag: makeOnDrag(element),
    visible: !isDragging,
  });
  
  const view = (
    use(Plot, {
      children: [
        draggingElement != null ? use(AxisHelper, {width: 3}) : null,
        draggingElement != null ? use(AxisHelper, {width: 3, opacity: 0.35, mode: 'transparent', depthTest: false}) : null,

        moveX ? use(GizmoAxis, gizmoProps(0)) : null,
        moveY ? use(GizmoAxis, gizmoProps(1)) : null,
        moveZ ? use(GizmoAxis, gizmoProps(2)) : null,

        moveXY ? use(GizmoPlane, gizmoProps(3)) : null,
        moveYZ ? use(GizmoPlane, gizmoProps(4)) : null,
        moveZX ? use(GizmoPlane, gizmoProps(5)) : null,

        rotateX ? use(GizmoRotate, gizmoProps(6)) : null,
        rotateY ? use(GizmoRotate, gizmoProps(7)) : null,
        rotateZ ? use(GizmoRotate, gizmoProps(8)) : null,

        scaleX ? use(GizmoScale, gizmoProps(9)) : null,
        scaleY ? use(GizmoScale, gizmoProps(10)) : null,
        scaleZ ? use(GizmoScale, gizmoProps(11)) : null,
      ],
    })
  );

  const [context] = useCombinedMatrixTransform(local);

  return provide(TransformContext, context, view);
};

export const GizmoAxis: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {axis, absolute, xformNonUniform, value, visible, onChange, onDrag} = props;

  const end = Z.slice() as XYZ;
  const color = [0.2, 0.2, 0.2];

  end[axis] = 1;
  color[axis] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const line = [Z, end];

  const handlers = useDrag(
    lineConstraint(line),
    () => ({apply: applyCartesianDrag([axis], absolute) }),
    xformNonUniform,
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
  const {axis, absolute, xformNonUniform, value, visible, onChange, onDrag} = props;
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
    () => ({ apply: applyCartesianDrag(axes, absolute) }),
    xformNonUniform,
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
  const {axis, absolute, xformUniform, value, visible, steps = 16, onChange, onDrag} = props;
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
    planeConstraint(plane),
    (hit: XYZ) => ({
      hit: polarTangentConstraint(axis, hit),
      apply: applyPolarDrag(axis, absolute),
    }),

    xformUniform,
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

export const GizmoScale: LC<GizmoScaleProps> = (props: GizmoScaleProps) => {
  const {axis, absolute, xformUniform, nonUniform, negative, value, visible, onChange, onDrag} = props;

  const end = Z.slice() as XYZ;
  const color = [0.2, 0.2, 0.2];

  end[axis] = 1;
  color[axis] = 1;

  color[0] += color[2] * .2;
  color[1] += color[2] * .3;

  const line = [Z, end];

  const handlers = useDrag(
    lineConstraint(line),
    () => ({ apply: applyScaleDrag(axis, absolute, negative, nonUniform) }),
    xformUniform,
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
