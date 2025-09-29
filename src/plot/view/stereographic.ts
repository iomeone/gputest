import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { AxesTrait, ObjectTrait, Axis4, Swizzle } from '../types';

import { parseMatrix, parsePosition, parseRotation, parseQuaternion, parseScale } from '@use-gpu/traits';
import { use, provide, signal, useContext, useOne, useMemo } from '@use-gpu/live';
import { chainTo, swizzleTo } from '@use-gpu/shader/wgsl';
import {
  TransformContext,
  useShaderRef, useBoundShader, useCombinedTransform,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { recenterAxis } from '../util/axis';
import { composeTransform } from '../util/compose';
import { swizzleMatrix, toBasis, rotateBasis, invertBasis } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { useAxesTrait, useObjectTrait } from '../traits';

import { getStereographicPosition } from '@use-gpu/wgsl/transform/stereographic.wgsl';

export type StereographicProps = Partial<AxesTrait> & Partial<ObjectTrait> & {
  bend?: number,
  normalize?: number | boolean,
  on?: Axis4,
};

export const Stereographic: LiveComponent<StereographicProps> = (props: PropsWithChildren<StereographicProps>) => {
  const {
    on = 'z',
    bend = 1,
    normalize = 1,
    children,
  } = props;

  const {range: g, axes: a} = useAxesTrait(props);
  const {position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useObjectTrait(props);

  const [matrix, swizzle, epsilon] = useMemo(() => {
    const x = g[0][0];
    const y = g[1][0];
    let   z = g[2][0];
    const dx = (g[0][1] - x) || 1;
    const dy = (g[1][1] - y) || 1;
    let   dz = (g[2][1] - z) || 1;

    // Epsilon for differential transport
    const epsilon = (Math.abs(dx) + Math.abs(dy) + Math.abs(dz)) / 3000;

    // Recenter viewport on origin the more it's bent
    [z, dz] = recenterAxis(z, dz, bend, 1);

    const matrix = mat4.create();
    mat4.set(matrix,
      2/dx, 0, 0, 0,
      0, 2/dy, 0, 0,
      0, 0, 2/dz, 0,

      -(2*x+dx)/dx,
      -(2*y+dy)/dy,
      -(2*z+dz)/dz,
      1,
    );

    // Swizzle output axes
    if (a !== 'xyzw') {
      const t = mat4.create();
      swizzleMatrix(t, a);
      mat4.multiply(matrix, t, matrix);
    }

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (m) {
      mat4.multiply(matrix, m, matrix);
    }
    if (p || r || q || s) {
      const t = mat4.create();
      composeTransform(t, p, r, q, s);
      mat4.multiply(matrix, t, matrix);
    }

    // Swizzle active polar axis
    let swizzle: string | null = null;
    if (on !== 'z') {
      const order = swizzle = rotateBasis(toBasis(on), 2);
      const t = mat4.create();
      // Apply inverse polar basis as part of view matrix (right multiply)
      swizzleMatrix(t, invertBasis(order));
      mat4.multiply(matrix, matrix, t);
    }

    return [matrix, swizzle, epsilon];
  }, [g, a, p, r, q, s, bend]);

  const t = useShaderRef(matrix);

  const b = useShaderRef(bend);
  const o = useShaderRef(+normalize);
  const e = useShaderRef(epsilon);
  
  const bound = useBoundShader(getStereographicPosition, [t, b, o]);

  // Apply input basis as a cast
  const xform = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const context = useCombinedTransform(xform, null, null, e);

  const rangeMemo = useOne(() => g, JSON.stringify(g));

  return [
    signal(),
    provide(TransformContext, context,
      provide(RangeContext, rangeMemo, children ?? [])
    )
  ];
};
