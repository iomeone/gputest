import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { AxesTrait, ObjectTrait, Swizzle } from '../types';

import { parseMatrix, parsePosition, parseRotation, parseQuaternion, parseScale, useProp } from '@use-gpu/traits';
import { use, provide, useContext, useOne, useMemo } from '@use-gpu/live';
import { bundleToAttributes, chainTo, swizzleTo } from '@use-gpu/shader/wgsl';
import {
  TransformContext,
  useShaderRef, useBoundShader, useCombinedTransform,
} from '@use-gpu/workbench';
import { parseAxes } from '@use-gpu/traits';

import { RangeContext } from '../providers/range-provider';
import { composeTransform } from '../util/compose';
import { recenterAxis } from '../util/axis';
import { swizzleMatrix, invertBasis, toBasis } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { useAxesTrait, useObjectTrait } from '../traits';

import { getSphericalPosition } from '@use-gpu/wgsl/transform/spherical.wgsl';

const POLAR_BINDINGS = bundleToAttributes(getSphericalPosition);

export type SphericalProps = Partial<AxesTrait> & Partial<ObjectTrait> & {
  bend?: number,
  helix?: number,
  on?: Swizzle,

  children?: LiveElement<any>,
};

export const Spherical: LiveComponent<SphericalProps> = (props) => {
  const {
    bend = 1,
    helix = 0,
    children,
  } = props;

  const on = useProp(props.on, parseAxes);
  const {range: g, axes: a} = useAxesTrait(props);
  const {position: p, scale: s, quaterion: q, rotation: r, matrix: m} = useObjectTrait(props);

  const [focus, aspectX, aspectY, scaleY, matrix, swizzle, range] = useMemo(() => {
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

    const matrix = mat4.create();
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
      const t = mat4.create();
      swizzleMatrix(t, a);
      mat4.multiply(matrix, t, matrix);
    }

    // Then apply transform (so these are always relative to the world basis, not the internal basis)
    if (p || r || q || s) {
      const t = mat4.create();
      composeTransform(t, p, r, q, s);
      mat4.multiply(matrix, t, matrix);
    }

    // Swizzle active spherical axes
    let swizzle: string | null = null;
    if (on.slice(0, 2) !== 'xy') {
      const order = swizzle = on;
      const t = mat4.create();

      // Apply inverse basis as part of view matrix (right multiply)
      swizzleMatrix(t, invertBasis(order));
      mat4.multiply(matrix, matrix, t);
    }

    // Adjust radial range
    const range = g.slice();
    if (bend > 0) {
      const [from, to] = range[2];
      const max = Math.max(Math.abs(from), Math.abs(to));
      const min = Math.max(-focus / aspectX, from);
      range[2] = [min, max];
    }

    return [focus, aspectX, aspectY, scaleY, matrix, swizzle, range];
  }, [g, a, p, r, q, s, bend, helix]);

  const b = useShaderRef(bend);
  const f = useShaderRef(focus);
  const u = useShaderRef(aspectX);
  const v = useShaderRef(aspectY);
  const c = useShaderRef(scaleY);
  const t = useShaderRef(matrix);

  const bound = useBoundShader(getSphericalPosition, POLAR_BINDINGS, [b, f, u, v, c, t]);

  // Apply input basis as a cast
  const position = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const transform = useCombinedTransform(position);

  return (
    provide(TransformContext, transform,
      provide(RangeContext, range, children ?? [])
    )
  );
};
