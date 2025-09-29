import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ColorLike, VectorLike } from '@use-gpu/traits';
import type { ShadowMapLike } from './types';

import { optional, parseColor, parseNumber, parsePosition, parseVec2, parseVec3, useProp } from '@use-gpu/traits';
import { memo, useMemo, useOne } from '@use-gpu/live';

import { useLightContext } from '../providers/light-provider';
import { useMatrixContext } from '../providers/matrix-provider';

import { mat4, vec3, vec4 } from 'gl-matrix';

import { DIRECTIONAL_LIGHT } from './types';

export type DirectionalLightProps = {
  position?: VectorLike,
  direction?: VectorLike,
  color?: ColorLike,
  intensity?: number,
  shadowMap?: ShadowMapLike,
};

const DEFAULT_DIRECTION = vec3.fromValues(1, 3, 2);

const DEFAULT_SHADOW_MAP = {
  size: [1024, 1024],
  depth: [0.1, 1000],
  span: [1000, 1000],
  up: [0, 1, 0],

  bias: [1/4096, 1/32],
  blur: 4,
};

const parseOptionalPosition = optional(parsePosition);

export const DirectionalLight = memo((props: DirectionalLightProps) => {
  
  const position = useProp(props.position, parsePosition, DEFAULT_DIRECTION);
  const direction = useProp(props.direction, parseOptionalPosition);
  const color = useProp(props.color, parseColor);
  const intensity = useProp(props.intensity, parseNumber, 1);

  const normal = useOne(() =>
    direction ? vec4.clone(direction as any as vec4) : vec4.fromValues(-position[0], -position[1], -position[2], 0),
    direction ?? position
  );

  const {shadowMap} = props;
  const parent = useMatrixContext();

  const [into, shadow] = useMemo(() => {
    if (!shadowMap) return [null, null];

    const size  = parseVec2(shadowMap.size  ?? DEFAULT_SHADOW_MAP.size);
    const depth = parseVec2(shadowMap.depth ?? DEFAULT_SHADOW_MAP.depth);
    const bias  = parseVec2(shadowMap.bias  ?? DEFAULT_SHADOW_MAP.bias);
    const span  = parseVec2(shadowMap.span  ?? DEFAULT_SHADOW_MAP.span);
    const up    = parseVec3(shadowMap.up    ?? DEFAULT_SHADOW_MAP.up);
    const blur  = parseNumber(shadowMap.blur ?? DEFAULT_SHADOW_MAP.blur);

    const matrix = mat4.create();
    const tangent = vec3.create();
    const bitangent = vec3.create();

    vec3.normalize(normal as vec3, normal as vec3);
    vec3.cross(tangent, normal as vec3, up);
    vec3.normalize(tangent, tangent);
    vec3.cross(bitangent, normal as vec3, tangent);
    mat4.set(matrix,
      tangent[0], tangent[1], tangent[2], 0.0,
      bitangent[0], bitangent[1], bitangent[2], 0.0,
      normal[0], normal[1], normal[2], 0.0,
      position[0], position[1], position[2], 1.0,
    );

    const [w, h] = span;
    const [near, far] = depth;
    mat4.scale(matrix, matrix, [w/2, h/2, near - far]);

    if (parent) mat4.multiply(matrix, parent, matrix);

    mat4.invert(matrix, matrix);
    matrix[14] += far / (far - near);

    const shadow = {type: 'ortho', size, depth, bias, blur};
    return [matrix, shadow];
  }, [position, normal, shadowMap, parent]);

  const light = useMemo(() => {
    let p = vec4.clone(position as any as vec4);
    let n = vec4.clone(normal as any as vec4);
    p[3] = 1;
    n[3] = 0;

    if (parent) {
      vec4.transformMat4(p, p, parent);
      vec4.transformMat4(n, n, parent);
    }

    return {
      kind: DIRECTIONAL_LIGHT,
      into,
      position: p,
      normal: n,
      color,
      intensity,
      shadow,
    };
  }, [position, normal, color, intensity, shadow, parent]);

  const {useLight} = useLightContext();
  useLight(light);

  return null;
}, 'DirectionalLight');
