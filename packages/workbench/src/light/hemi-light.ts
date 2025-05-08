import type { LC } from '@use-gpu/live';
import type { ColorLike, VectorLike } from '@use-gpu/core';
import type { ShadowMapLike } from './types';

import { optional, useProp } from '@use-gpu/traits/live';
import { parseColor, parseNumber, parsePosition, parseVec2, parseVec3 } from '@use-gpu/parse';
import { memo, use, useMemo } from '@use-gpu/live';

import { useLightContext } from '../providers/light-provider';
import { useMatrixContext } from '../providers/matrix-provider';

import { mat4, vec3, vec4 } from 'gl-matrix';

import { HEMI_LIGHT } from './types';
import { PointHelper } from '../helpers/point-helper';
import { VectorHelper } from '../helpers/vector-helper';
import { ConeHelper } from '../helpers/cone-helper';

const parseOptionalPosition = optional(parsePosition);

export type HemiLightProps = {
  position?: VectorLike,
  direction?: VectorLike,
  color?: ColorLike,
  intensity?: number,
  cutoff?: number,
  fov?: number,
  feather?: number,
  shadowMap?: ShadowMapLike,
  debug?: boolean,
};

const DEFAULT_SHADOW_MAP = {
  size: [2048, 2048],
  depth: [0.1, 1000],
  up: [0, 1, 0],

  bias: [1/4096, 1/512, 0],
  blur: 4,
  resolution: 0.85,
};

export const HemiLight: LC<HemiLightProps> = memo((props: HemiLightProps) => {

  const position = useProp(props.position, parsePosition);
  const direction = useProp(props.direction, parseOptionalPosition);
  const color = useProp(props.color, parseColor);
  const intensity = useProp(props.intensity, parseNumber, 1);
  const cutoff = Math.pow(useProp(props.cutoff, parseNumber, 0.01), 1/2.2);
  const fov = useProp(props.fov, parseNumber, 180);
  const feather = useProp(props.feather, parseNumber, 5);

  const {shadowMap} = props;
  const parent = useMatrixContext();

  const [into, shadow, normal,, far] = useMemo(() => {
    const normal = vec3.create();
    vec3.normalize(normal, (direction ?? [0, 0, -1]) as vec3);

    if (!shadowMap) return [null, null, normal, 0, 0];

    const size       = parseVec2(shadowMap.size  ?? DEFAULT_SHADOW_MAP.size);
    const depth      = parseVec2(shadowMap.depth ?? DEFAULT_SHADOW_MAP.depth);
    const bias       = parseVec3(shadowMap.bias  ?? DEFAULT_SHADOW_MAP.bias);
    const up         = parseVec3(shadowMap.up    ?? DEFAULT_SHADOW_MAP.up);
    const blur       = parseNumber(shadowMap.blur ?? DEFAULT_SHADOW_MAP.blur);
    const resolution = parseNumber(shadowMap.resolution ?? DEFAULT_SHADOW_MAP.resolution);

    const matrix = mat4.create();

    const tangent = vec3.create();
    const bitangent = vec3.create();
    vec3.cross(tangent, normal as vec3, up);
    
    if (vec3.length(tangent) < 1e-5) {
      vec3.cross(tangent, normal as vec3, [up[1], up[2], up[0]]);
    }

    vec3.normalize(tangent, tangent);
    vec3.cross(bitangent, normal as vec3, tangent);
    mat4.set(matrix,
      bitangent[0], bitangent[1], bitangent[2], 0.0,
      normal[0], normal[1], normal[2], 0.0,
      tangent[0], tangent[1], tangent[2], 0.0,
      position[0], position[1], position[2], 1.0,
    );

    if (parent) mat4.multiply(matrix, parent, matrix);

    mat4.invert(matrix, matrix);

    const [near, far] = depth;
    const shadow = {type: 'hemi', size, depth, bias, blur, resolution};
    return [matrix, shadow, normal, near, far];
  }, [position, direction, shadowMap, parent]);

  const light = useMemo(() => {
    const p = vec4.clone(position as any as vec4);
    const n = vec4.clone(normal as any as vec4);
    p[3] = 1;
    n[3] = 0;

    if (parent) {
      vec4.transformMat4(p, p, parent);
      vec4.transformMat4(n, n, parent);
    }
    
    const cosFov = Math.cos(fov / 2 * Math.PI / 180);
    const cosFeather = Math.cos((fov / 2 - feather) * Math.PI / 180);
    const featherRamp = 1 / (cosFeather - cosFov);

    return {
      kind: HEMI_LIGHT,
      into,
      position: p,
      normal: n,
      color,
      cutoff,
      intensity,
      opts: [cosFov, featherRamp, 0, 0],
      shadow,
    };
  }, [into, position, normal, color, intensity, cutoff, fov, shadow, parent]);

  const {useLight} = useLightContext();
  useLight(light);

  if (!props.debug) return null;

  return [
    use(PointHelper, { position, color }),
    use(VectorHelper, { position, direction, color, length: far || 100 }),
    use(ConeHelper, { position, direction, angle: fov, color, length: far || 100 }),
  ];
}, 'HemiLight');
