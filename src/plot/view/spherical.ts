import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Swizzle } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait, useProp } from '@use-gpu/traits/live';
import { parseAxes } from '@use-gpu/parse';
import { provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { chainTo, swizzleTo } from '@use-gpu/shader/wgsl';
import {
  MatrixContext, TransformContext, QueueReconciler,
  useShaderRef, useShader, useCombinedEpsilonTransform,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { composeTransform } from '../util/compose';
import { recenterAxis } from '../util/axis';
import { swizzleMatrix, invertBasis } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { AxesTrait, ObjectTrait } from '../traits';

import { getSphericalPosition } from '@use-gpu/wgsl/transform/spherical.wgsl';

const {signal} = QueueReconciler;
const makeMat4 = () => mat4.create();

const Traits = combine(AxesTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type SphericalProps = TraitProps<typeof Traits> & PropsWithChildren<{
  bend?: number,
  helix?: number,
  on?: Swizzle,
}>;

export const Spherical: LiveComponent<SphericalProps> = (props: SphericalProps) => {
  const {
    bend = 1,
    helix = 0,
    children,
  } = props;

  const on = useProp(props.on, parseAxes);
  const {
    range: g, axes: a,
    position: p, scale: s, quaternion: q, rotation: r, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

  const [focus, aspectX, aspectY, scaleY, matrix, swizzle, range, epsilon] = useMemo(() => {
    const x = g[0][0];
    let   y = g[1][0];
    let   z = g[2][0];
    const dx = (g[0][1] - x) || 1;
    let   dy = (g[1][1] - y) || 1;
    let   dz = (g[2][1] - z) || 1;

    // Make scale adjustments relative to inverse swizzled output scale
    const inv = invertBasis(a);
    const sx = s ? s[inv.indexOf('x')] : 1;
    const sy = s ? s[inv.indexOf('y')] : 1;
    const sz = s ? s[inv.indexOf('z')] : 1;

    // Epsilon for differential transport
    const epsilon = (Math.abs(dx) + Math.abs(dy) + Math.abs(dz)) / 3000;

    // Watch for negative scales.
    const idx = dx > 0 ? 1 : -1;
    const idy = dy > 0 ? 1 : -1;

    // Recenter viewport on origin the more it's bent
    [y, dy] = recenterAxis(y, dy, bend);
    [z, dz] = recenterAxis(z, dz, bend);

    // Adjust viewport range for spherical transform.
    // As the viewport goes spherical, the X/Y-ranges are interpolated to the Z-range,
    // creating a perfectly spherical viewport.
    const adz = Math.abs(dz);
    const fdx = dx + (adz * idx - dx) * bend;
    const fdy = dy + (adz * idy - dy) * bend;
    const sdx = fdx / sx;
    const sdy = fdy / sy;
    const sdz = dz  / sz;

    const aspectX = Math.abs(sdx / sdz);
    const aspectY = Math.abs(sdy / sdz / aspectX);

    // Scale Y coordinates before transforming, but cap at aspectY/alpha to prevent from poking through the poles mid-transform.
    // Factor of 2 due to the fact that in the Y direction we only go 180º from pole to pole.
    const aspectZ = dy / dx * sx / sy * 2
    const scaleY = Math.min(aspectY / bend, 1 + (aspectZ - 1) * bend);

    const focus = bend > 0 ? 1 / bend - 1 : 0;

    const matrix = swapMatrix();
    mat4.set(matrix,
      2/fdx, 0, 0, 0,
      0, 2/fdy, 0, 0,
      0,  0, 2/dz, 0,

      -(2*x+dx)/dx,
      -(2*y+dy)/dy,
      -(2*z+dz)/dz,
      1,
    );

    // Swizzle output axes
    if (a !== 'xyzw') {
      swizzleMatrix(composed, a);
      mat4.multiply(matrix, composed, matrix);
    }

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (m) {
      mat4.multiply(matrix, m, matrix);
    }
    if (p || r || q || s) {
      composeTransform(composed, p, r, q, s);
      mat4.multiply(matrix, composed, matrix);
    }

    // Swizzle active spherical axes
    let swizzle: string | null = null;
    if (on.slice(0, 3) !== 'xyz') {
      const order = swizzle = on;

      // Apply inverse basis as part of view matrix (right multiply)
      swizzleMatrix(composed, invertBasis(order));
      mat4.multiply(matrix, matrix, composed);
    }

    // Adjust radial range
    const range = g.slice();
    if (bend > 0) {
      const [from, to] = range[2];
      const max = Math.max(Math.abs(from), Math.abs(to));
      const min = Math.max(-focus / aspectX, from);
      range[2] = [min, max];
    }

    return [focus, aspectX, aspectY, scaleY, matrix, swizzle, range, epsilon];
  }, [g, a, p, r, q, s, bend, helix]);

  const t = useShaderRef(matrix);

  const b = useShaderRef(bend);
  const f = useShaderRef(focus);
  const u = useShaderRef(aspectX);
  const v = useShaderRef(aspectY);
  const c = useShaderRef(scaleY);
  const e = useShaderRef(epsilon);

  const bound = useShader(getSphericalPosition, [t, b, f, u, v, c]);

  // Apply input basis as a cast
  const xform = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const context = useCombinedEpsilonTransform(xform, e);

  const rangeMemo = useOne(() => range, JSON.stringify(range));

  return [
    signal(),
    provide(MatrixContext, null,
      provide(TransformContext, context,
        provide(RangeContext, rangeMemo, children ?? [])
      )
    )
  ];
};
