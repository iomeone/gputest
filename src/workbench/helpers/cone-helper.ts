import type { LC } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';

import { seq } from '@use-gpu/core';
import { memo, use, provide, useMemo } from '@use-gpu/live';
import { useRawSource } from '../hooks/useRawSource';
import { LineLayer } from '../layers/line-layer';
import { TransformContext } from '../providers/transform-provider';
import { useCombinedMatrixTransform } from '../hooks/useCombinedTransform';

import { mat4, vec3 } from 'gl-matrix';

type ConeHelperProps = {
  position?: number[] | TypedArray,
  direction?: number[] | TypedArray,
  up?: number[] | TypedArray,

  color?: number[] | TypedArray,
  width?: number,

  angle?: number,
  length?: number,
  detail?: number,

  radial?: boolean,
};

const ORIGIN = [0, 0, 0];
const DIRECTION = [1, 0, 0];
const UP = [0, 1, 0];

export const ConeHelper: LC<ConeHelperProps> = memo((props: ConeHelperProps) => {
  const {
    position = ORIGIN,
    direction = DIRECTION,
    up = UP,

    angle = 90,
    length = 1,
    detail = 64,

    color = [1, 0.75, 0.5, 1],
    width = 3,

    radial = false,
  } = props;

  const matrix = useMemo(() => {

    const matrix = mat4.create();

    const normal = vec3.create();
    const tangent = vec3.create();
    const bitangent = vec3.create();

    vec3.normalize(normal as vec3, direction as vec3);
    vec3.cross(tangent, normal as vec3, up as vec3);
    vec3.normalize(tangent, tangent);
    vec3.cross(bitangent, normal as vec3, tangent);
    mat4.set(matrix,
      tangent[0], tangent[1], tangent[2], 0.0,
      bitangent[0], bitangent[1], bitangent[2], 0.0,
      normal[0], normal[1], normal[2], 0.0,
      position[0], position[1], position[2], 1.0,
    );

    return matrix;
  }, [position, direction, up]);

  const [context] = useCombinedMatrixTransform(matrix);

  const [ps, ss] = useMemo(() => {
    const ratio = Math.tan(angle / 2 * Math.PI / 180);
    const radius = radial ? length : length * ratio;
    const width = radial ? length / ratio : length;

    const circle = seq(detail + 1).map(i => {
      const th = i / detail * Math.PI * 2;
      return [Math.cos(th) * radius, Math.sin(th) * radius, width, 1];
    });

    const indices = [
      ...seq(detail + 1, 1),
      1,
      ...seq(4).flatMap(i => [0, 1 + Math.floor(detail / 4 * i)]),
      0, 0,
    ];

    const positions = [
      [0, 0, 0, 1],
      ...circle,
    ];

    const segments = [1, ...seq(detail).map(() => 3), 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 0, 0, 0];

    const vertices = indices.flatMap(i => positions[i]);

    return [
      new Float32Array(vertices),
      new Uint8Array(segments.slice(0, (segments.length >> 2) << 2)),
    ];
  }, [detail, angle, length, radial]);

  const positions = useRawSource(ps, 'vec4<f32>');
  const segments = useRawSource(ss, 'i8');

  return (
    provide(TransformContext, context,
      use(LineLayer, { count: segments.length, positions, segments, color, width }),
    )
  );
}, 'ConeHelper');
