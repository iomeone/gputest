import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Axis4 } from '../types';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait } from '@use-gpu/traits/live';
import { provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { chainTo, swizzleTo } from '@use-gpu/shader/wgsl';
import {
  MatrixContext, TransformContext, QueueReconciler,
  useShaderRef, useShader, useCombinedEpsilonTransform,
} from '@use-gpu/workbench';

import { RangeContext } from '../providers/range-provider';
import { recenterAxis } from '../util/axis';
import { composeTransform } from '../util/compose';
import { swizzleMatrix, toBasis, rotateBasis, invertBasis } from '../util/swizzle';
import { mat4 } from 'gl-matrix';

import { AxesTrait, ObjectTrait } from '../traits';

import { getStereographicPosition } from '@use-gpu/wgsl/transform/stereographic.wgsl';

const {signal} = QueueReconciler;
const makeMat4 = () => mat4.create();

const Traits = combine(AxesTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type StereographicProps = TraitProps<typeof Traits> & PropsWithChildren<{
  bend?: number,
  normalize?: number | boolean,
  on?: Axis4,
}>;

export const Stereographic: LiveComponent<StereographicProps> = (props: StereographicProps) => {
  const {
    on = 'z',
    bend = 1,
    normalize = 1,
    children,
  } = props;

  const {
    range: g, axes: a,
    position: p, scale: s, quaternion: q, rotation: r, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

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

    const matrix = swapMatrix();
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

    // Swizzle active polar axis
    let swizzle: string | null = null;
    if (on !== 'z') {
      const order = swizzle = rotateBasis(toBasis(on), 2);
      // Apply inverse polar basis as part of view matrix (right multiply)
      swizzleMatrix(composed, invertBasis(order));
      mat4.multiply(matrix, matrix, composed);
    }

    return [matrix, swizzle, epsilon];
  }, [g, a, p, r, q, s, bend]);

  const t = useShaderRef(matrix);

  const b = useShaderRef(bend);
  const o = useShaderRef(+normalize);
  const e = useShaderRef(epsilon);

  const bound = useShader(getStereographicPosition, [t, b, o]);

  // Apply input basis as a cast
  const xform = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const context = useCombinedEpsilonTransform(xform, e);

  const rangeMemo = useOne(() => g, JSON.stringify(g));

  return [
    signal(),
    provide(MatrixContext, null,
      provide(TransformContext, context,
        provide(RangeContext, rangeMemo, children ?? [])
      )
    )
  ];
};
