import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { AxesTrait, ObjectTrait, Axis4, Swizzle } from '../types';

import { parseMatrix, parsePosition, parseRotation, parseQuaternion, parseScale } from '@use-gpu/traits';
import { use, provide, signal, useContext, useOne, useMemo } from '@use-gpu/live';
import { swizzleTo, chainTo } from '@use-gpu/shader/wgsl';
import {
  TransformContext,
  useShaderRef, useBoundShader, useCombinedTransform,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { composeTransform } from '../util/compose';
import { recenterAxis } from '../util/axis';
import { swizzleMatrix, toBasis, invertBasis } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { useAxesTrait, useObjectTrait } from '../traits';

import { getPolarPosition } from '@use-gpu/wgsl/transform/polar.wgsl';

export type PolarProps = Partial<AxesTrait> & Partial<ObjectTrait> & {
  bend?: number,
  helix?: number,
  on?: Axis4,
};

export const Polar: LiveComponent<PolarProps> = (props: PropsWithChildren<PolarProps>) => {
  const {
    bend = 1,
    helix = 0,
    on = 'x',
    children,
  } = props;

  const {range: g, axes: a} = useAxesTrait(props);
  const {position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useObjectTrait(props);

  const [focus, aspect, matrix, swizzle, range, epsilon] = useMemo(() => {
    const x = g[0][0];
    let   y = g[1][0];
    const z = g[2][0];
    const dx = (g[0][1] - x) || 1;
    let   dy = (g[1][1] - y) || 1;
    const dz = (g[2][1] - z) || 1;

    // Make scale adjustments relative to inverse swizzled output scale
    const inv = invertBasis(a);
    const sx = s ? s[inv.indexOf('x')] : 1;
    const sy = s ? s[inv.indexOf('y')] : 1;
    const sz = s ? s[inv.indexOf('z')] : 1;

    // Epsilon for differential transport
    const epsilon = (Math.abs(dx) + Math.abs(dy) + Math.abs(dz)) / 3000;

    // Watch for negative scales
    const idx = Math.sign(dx);

    // Recenter viewport on origin the more it's bent
    [y, dy] = recenterAxis(y, dy, bend);

    // Adjust viewport range for polar transform.
    // As the viewport goes polar, the X-range is interpolated to the Y-range instead,
    // creating a square/circular viewport.
    const ady = Math.abs(dy);
    const fdx = dx + (ady * idx - dx) * bend;
    const sdx = fdx / sx;
    const sdy = dy  / sy;
    
    const aspect = Math.abs(sdx / sdy);
    const focus = bend > 0 ? 1 / bend - 1 : 0;

    const matrix = mat4.create();
    mat4.set(matrix,
      2/fdx, 0, 0, 0,
      0,  2/dy, 0, 0,
      0,  0, 2/dz, 0,

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
    if (on !== 'x') {
      const order = swizzle = toBasis(on);
      const t = mat4.create();

      // Apply inverse polar basis as part of view matrix (right multiply)
      swizzleMatrix(t, invertBasis(order));
      mat4.multiply(matrix, matrix, t);
    }

    // Adjust radial range
    const range = g.slice();
    if (bend > 0) {
      const [from, to] = range[1];
      const max = Math.max(Math.abs(from), Math.abs(to));
      const min = Math.max(-focus / aspect, from);
      range[1] = [min, max];
    }

    return [focus, aspect, matrix, swizzle, range, epsilon];
  }, [g, a, p, r, q, s, bend, helix, on]);

  const t = useShaderRef(matrix);

  const b = useShaderRef(bend);
  const f = useShaderRef(focus);
  const c = useShaderRef(aspect);
  const h = useShaderRef(helix);
  const e = useShaderRef(epsilon);

  const bound = useBoundShader(getPolarPosition, [t, b, f, c, h]);

  // Apply input basis as a cast
  const xform = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const context = useCombinedTransform(xform, null, null, e);

  const rangeMemo = useOne(() => range, JSON.stringify(range));

  return [
    signal(),
    provide(TransformContext, context,
      provide(RangeContext, rangeMemo, children ?? [])
    )
  ];
};
