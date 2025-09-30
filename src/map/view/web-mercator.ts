import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { Swizzle } from '@use-gpu/plot';
import type { TraitProps } from '@use-gpu/traits';

import { combine, makeUseTrait } from '@use-gpu/traits/live';
import { use, provide, useDouble, useOne, useMemo } from '@use-gpu/live';
import { chainTo, swizzleTo } from '@use-gpu/shader/wgsl';
import {
  TransformContext, QueueReconciler,
  useShaderRef, useShader, useCombinedEpsilonTransform,
} from '@use-gpu/workbench';

import {
  RangeContext, Scissor,
  composeTransform, swizzleMatrix, toBasis, toOrder, rotateBasis, invertBasis,
  AxesTrait, ObjectTrait,
} from '@use-gpu/plot';
import { mat4 } from 'gl-matrix';

import { GeographicTrait } from '../traits';
import { EARTH_CIRCUMFERENCE, toRad } from '../util/tiles';

import { getWebMercatorPosition } from '@use-gpu/wgsl/transform/web-mercator.wgsl';

const {signal} = QueueReconciler;

const MERCATOR_LOOP = [2, 0, 0, 0];
const π = Math.PI;
const makeMat4 = () => mat4.create();

const Traits = combine(AxesTrait, GeographicTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type WebMercatorProps = TraitProps<typeof Traits> & PropsWithChildren<{
  bend?: number,
  on?: Swizzle,
  centered?: boolean,
  native?: boolean,
  scissor?: boolean,
  radius?: number,
}>;

export const WebMercator: LiveComponent<WebMercatorProps> = (props: WebMercatorProps) => {
  const {
    on = 'xyz',
    bend = 1,
    centered = false,
    native = false,
    radius = EARTH_CIRCUMFERENCE,
    scissor = false,
    children,
  } = props;

  const {
    axes: a, range: g,
    long, lat, zoom,
    position: p, scale: s, quaternion: q, rotation: r, matrix: m,
  } = useTraits(props);

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

  const [matrix, swizzle, origin, range, epsilon] = useMemo(() => {
    const matrix = swapMatrix();

    // Get 2D bounding box
    const [ox, oy] = projectMercator([long, lat]);
    const origin = [ox, oy, toRad * lat];
    const span = 1 / (zoom || 1);

    // Epsilon for differential transport
    const epsilon = span / 100;

    const left = origin[0] + span * g[0][0];
    const right = origin[0] + span * g[0][1];
    const top = Math.max(-1, origin[1] + span * g[1][0]);
    const bottom = Math.min(1, origin[1] + span * g[1][1]);

    // Unproject and set lat/long range + conformal Z
    const tl = native ? [left, top] : unprojectMercator([left, top]);
    const br = native ? [right, bottom] : unprojectMercator([right, bottom]);

    let range = [[tl[0], br[0]], [tl[1], br[1]], [span*g[2][0], span*g[2][1]], g[3]];

    // Swizzle output axes (and reinitialize matrix)
    swizzleMatrix(matrix, a);

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
      const order = invertBasis(swizzle = rotateBasis(toBasis(on), 2));
      // Apply inverse spherical basis as part of view matrix (right multiply)
      swizzleMatrix(composed, order);
      mat4.multiply(matrix, matrix, composed);

      const orderIndices = toOrder(order);
      range = range.map((_, i) => range[orderIndices[i]]);
    }

    return [matrix, swizzle, origin, range, epsilon];
  }, [long, lat, zoom, native, a, g, p, r, q, s, bend]);

  const rangeMemo = useOne(() => range, JSON.stringify(range));
  const scissorRange = useOne(() => [range[0], range[1], range[2], [0, 2]], rangeMemo);

  const t = useShaderRef(matrix);

  const b = useShaderRef(bend);
  const o = useShaderRef(origin);
  const z = useShaderRef(zoom);
  const d = useShaderRef(radius);
  const c = useShaderRef(centered);
  const n = useShaderRef(native);
  const e = useShaderRef(epsilon);

  const bound = useShader(getWebMercatorPosition, [t, b, o, z, d, c, n]);

  // Apply input basis as a cast
  const xform = useMemo(() => {
    if (!swizzle) return bound;
    return chainTo(swizzleTo('vec4<f32>', 'vec4<f32>', swizzle), bound);
  }, [bound, swizzle]);

  const context = useCombinedEpsilonTransform(xform, e);

  const view = scissor ? use(Scissor, {range: scissorRange, loop: MERCATOR_LOOP, children}) : children;

  return [
    signal(),
    provide(TransformContext, context,
      provide(RangeContext, rangeMemo, view)
    )
  ];
};

const projectMercator = ([long, lat]: [number, number]) => [long * toRad / π, Math.log(Math.tan(π/4 + lat * toRad / 2.0)) / π];
const unprojectMercator = ([x, y]: [number, number]) => [x / toRad * π, (Math.atan(Math.exp(y * π)) - π/4) / toRad * 2.0];