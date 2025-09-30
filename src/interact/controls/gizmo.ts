import type { LC } from '@use-gpu/live';
import type { VectorLike, XYZ, XYZW } from '@use-gpu/core';

import { provide, use, useMemo, useState } from '@use-gpu/live';
import { seq, lerp } from '@use-gpu/core';

import { AxisHelper, TransformContext, useCombinedMatrixTransform } from '@use-gpu/workbench';
import { Plot, Line, Arrow, Polygon, Point } from '@use-gpu/plot';

import { Cursor } from '../handlers/cursor';
import { Pick, PickState } from '../handlers/pick';

import {
  useDrag,
  lineConstraint, planeConstraint, polarTangentConstraint,
  applyCartesianDrag, applyPolarDrag, applyScaleDrag,
  getDragFrame, getAbsoluteFrame,
  ORTHO_AXES_XYZ,
} from '../hooks/useDrag';
import {
  useGizmoMatrix
} from '../hooks/useGizmoMatrix';

import { mat4 } from 'gl-matrix';

export type GizmoMatrixProps = {
  value: mat4,
  onChange: (m: mat4) => void,
  onDrag?: (b: boolean) => void,

  size?: number,

  absolute?: boolean,
  nonUniform?: boolean,
  negative?: boolean,
  axes?: boolean,

  move?: boolean | string,
  rotate?: boolean | string,
  scale?: boolean | string,
  
  style?: GizmoMatrixStyles,
};

export type GizmoMatrixStyles = Record<string, Partial<GizmoMatrixStyle>>;

export type GizmoMatrixStyle = {
  color: VectorLike,
  stroke: VectorLike,
  fill: VectorLike,
  range: number,
  width: number,
  size: number,
  depth: number,
  zBias: number,
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
  
  element: string,
  style: GizmoMatrixStyles,
};

export type GizmoRotateProps = GizmoAxisProps & {
  steps?: number,
};

export type GizmoScaleProps = GizmoAxisProps & {
  negative?: boolean,
  nonUniform?: boolean,
};

const Z: XYZ = [0, 0, 0];

const GIZMO_ELEMENTS = [
  'moveX',
  'moveY',
  'moveZ',
  'moveYZ',
  'moveZX',
  'moveXY',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scaleX',
  'scaleY',
  'scaleZ',
];

export const DEFAULT_GIZMO_STYLE = {
  'moveX': {
    color: [1.0, 0.2, 0.3],
    width: 5,
    range: 15,
    zBias: 1,
  },
  'moveY': {
    color: [0.2, 1.0, 0.3],
    width: 5,
    range: 15,
    zBias: 1,
  },
  'moveZ': {
    color: [0.2, 0.4, 1.0],
    width: 5,
    range: 15,
    zBias: 1,
  },
  'moveX:hover': {
    width: 10,
  },
  'moveY:hover': {
    width: 10,
  },
  'moveZ:hover': {
    width: 10,
  },

  'moveXY': {
    stroke: [1.0, 1.0, 0.3, 0.5],
    fill: [1.0, 1.0, 0.3, 0.25],
    width: 2,
  },
  'moveYZ': {
    stroke: [0.2, 1.0, 1.0, 0.5],
    fill: [0.2, 1.0, 1.0, 0.25],
    width: 2,
  },
  'moveZX': {
    stroke: [1.0, 0.2, 1.0, 0.5],
    fill: [1.0, 0.2, 1.0, 0.25],
    width: 2,
  },
  'moveXY:hover': {
    stroke: [1.0, 1.0, 0.3, 1.0],
    fill: [1.0, 1.0, 0.3, 0.5],
  },
  'moveYZ:hover': {
    stroke: [0.2, 1.0, 1.0, 1.0],
    fill: [0.2, 1.0, 1.0, 0.5],
  },
  'moveZX:hover': {
    stroke: [1.0, 0.2, 1.0, 1.0],
    fill: [1.0, 0.2, 1.0, 0.5],
  },

  'rotateX': {
    color: [0.2, 1.0, 1.0, 0.5],
    width: 10,
    range: 20,
  },
  'rotateY': {
    color: [1.0, 0.2, 1.0, 0.5],
    width: 10,
    range: 20,
  },
  'rotateZ': {
    color: [1.0, 1.0, 0.2, 0.5],
    width: 10,
    range: 20,
  },
  'rotateX:hover': {
    color: [0.2, 1.0, 1.0, 1.0],
    width: 15,
  },
  'rotateY:hover': {
    color: [1.0, 0.2, 1.0, 1.0],
    width: 15,
  },
  'rotateZ:hover': {
    color: [1.0, 1.0, 0.2, 1.0],
    width: 15,
  },

  'scaleX': {
    color: [1.0, 0.2, 0.3],
    size: 10,
    range: 30,
    zBias: 3,
  },
  'scaleY': {
    color: [0.2, 1.0, 0.3],
    size: 10,
    range: 30,
    zBias: 3,
  },
  'scaleZ': {
    color: [0.2, 0.4, 1.0],
    size: 10,
    range: 30,
    zBias: 3,
  },
  'scaleX:hover': {
    size: 20,
  },
  'scaleY:hover': {
    size: 20,
  },
  'scaleZ:hover': {
    size: 20,
  },
};

export const GizmoMatrix: LC<GizmoMatrixProps> = (props: GizmoMatrixProps) => {
  const {
    value,
    onChange,
    onDrag,

    move,
    rotate,
    scale,

    axes,
    absolute,
    negative,
    nonUniform = typeof scale === 'object',

    style = DEFAULT_GIZMO_STYLE,
    size = .1,
  } = props;

  // Gizmo frame
  const uniformFrame = useMemo(() => (absolute ? getAbsoluteFrame : getDragFrame)(value), [absolute, value]);
  const nonUniformFrame = useMemo(() => absolute ? getAbsoluteFrame(value) : value, [absolute, value]);

  // Flip orientation relative to view
  const [local, xformUniform] = useGizmoMatrix({matrix: uniformFrame, size, flip: true});
  const [, xformNonUniform] = useGizmoMatrix({matrix: nonUniformFrame, size, flip: true});

  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const makeOnDrag = (element: number) => (dragging: boolean) => {
    setDraggingElement(dragging ? element : null);
    onDrag?.(dragging);
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

    element: GIZMO_ELEMENTS[element],
    style,
  });

  const view = (
    use(Plot, {
      children: [
        axes && draggingElement != null ? use(AxisHelper, {width: 3}) : null,
        axes && draggingElement != null ? use(AxisHelper, {width: 3, opacity: 0.35, mode: 'transparent', depthTest: false}) : null,

        moveX ? use(GizmoAxis, gizmoProps(0)) : null,
        moveY ? use(GizmoAxis, gizmoProps(1)) : null,
        moveZ ? use(GizmoAxis, gizmoProps(2)) : null,

        moveYZ ? use(GizmoPlane, gizmoProps(3)) : null,
        moveZX ? use(GizmoPlane, gizmoProps(4)) : null,
        moveXY ? use(GizmoPlane, gizmoProps(5)) : null,

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

const useElementStyle = (elementName: string, style: GizmoMatrixStyles) => {
  return useMemo(() => {
    const element = style[elementName];
    const hovered = {...element, ...style[elementName + ':hover']};
    return {element, hovered};
  }, [elementName, style]);
};

export const GizmoAxis: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {element, style, axis, absolute, xformNonUniform, value, visible, onChange, onDrag} = props;
  const styled = useElementStyle(element, style);

  const end = Z.slice() as XYZ;
  end[axis] = 1;

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
      render: ({id, hovered}: PickState) => {
        if (!visible) return null;
        
        const props = hovered ? styled.hovered : styled.element;

        return [
          hovered ? use(Cursor, {cursor: 'pointer'}) : null,
          use(Arrow, {
            positions: line,
            ...props,
            end: true,

            depthTest: false,
            depthWrite: false,
            mode: 'transparent'
          }),
          use(Line, {
            id,
            positions: line,
            ...props,
            width: props.range,
            mode: 'picking',
          }),
        ];
      }
    })
  );
};

export const GizmoPlane: LC<GizmoAxisProps> = (props: GizmoAxisProps) => {
  const {element, style, axis, absolute, xformNonUniform, value, visible, onChange, onDrag} = props;
  const styled = useElementStyle(element, style);

  const axes = ORTHO_AXES_XYZ[axis];

  const a = Z.slice() as XYZ;
  const b = Z.slice() as XYZ;
  const c = Z.slice() as XYZ;

  for (const [j, i] of axes.entries()) {
    b[i] = 0.5;
    (j ? c : a)[i] = 0.5;
  }

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
      render: ({id, hovered}: PickState) => {
        if (!visible) return null;
      
        const props = hovered ? styled.hovered : styled.element;
        
        return [
          hovered ? use(Cursor, {cursor: 'pointer'}) : null,
          use(Polygon, {
            positions: [Z, a, b, c],
            ...props,

            depthTest: false,
            depthWrite: false,
            mode: 'transparent'
          }),
          use(Polygon, {
            id,
            positions: [Z, a, b, c],
            ...props,
            width: props.range,
            mode: 'picking',
          }),
        ];
      }
    })
  );
};

export const GizmoRotate: LC<GizmoRotateProps> = (props: GizmoRotateProps) => {
  const {element, style, axis, absolute, xformUniform, value, visible, steps = 16, onChange, onDrag} = props;
  const styled = useElementStyle(element, style);

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
      render: ({id, hovered}: PickState) => {
        if (!visible) return null;

        const props = hovered ? styled.hovered : styled.element;

        return [
          hovered ? use(Cursor, {cursor: 'pointer'}) : null,
          use(Line, {
            positions: arc,
            ...props,

            depthTest: false,
            depthWrite: false,
            mode: 'transparent'
          }),
          use(Line, {
            id,
            positions: arc,
            ...props,
            width: props.range,
            mode: 'picking',
          }),
        ];
      },
    })
  );
};

export const GizmoScale: LC<GizmoScaleProps> = (props: GizmoScaleProps) => {
  const {element, style, axis, absolute, xformUniform, nonUniform, negative, value, visible, onChange, onDrag} = props;
  const styled = useElementStyle(element, style);

  const end = Z.slice() as XYZ;
  end[axis] = 1;

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
      render: ({id, hovered}: PickState) => {
        if (!visible) return null;

        const props = hovered ? styled.hovered : styled.element;

        return [
          hovered ? use(Cursor, {cursor: 'pointer'}) : null,
          use(Point, {
            position: end,
            ...props,

            depthTest: false,
            depthWrite: false,
            mode: 'transparent'
          }),
          use(Point, {
            id,
            position: end,
            ...props,
            mode: 'picking',
          }),
        ];
      },
    })
  );
};
