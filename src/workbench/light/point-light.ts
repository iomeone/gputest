import type { LC } from '@use-gpu/live';
import type { ColorLike, VectorLike } from '@use-gpu/core';
import type { ShadowMapLike } from './types';

import { useProp } from '@use-gpu/traits/live';
import { parseColor, parseNumber, parsePosition, parseVec2, parseVec3 } from '@use-gpu/parse';
import { memo, use, useMemo } from '@use-gpu/live';

import { useLightContext } from '../providers/light-provider';
import { useMatrixContext } from '../providers/matrix-provider';

import { mat4, vec3, vec4 } from 'gl-matrix';

import { POINT_LIGHT } from './types';
import { PointHelper } from '../helpers/point-helper';

export type PointLightProps = {
  position?: VectorLike,
  color?: ColorLike,
  intensity?: number,
  cutoff?: number,
  shadowMap?: ShadowMapLike,
  debug?: boolean,
};

const DEFAULT_SHADOW_MAP = {
  size: [2048, 2048],
  depth: [0.1, 1000],

  bias: [1/4096, 1/512, 0],
  blur: 4,
};

export const PointLight: LC<PointLightProps> = memo((props: PointLightProps) => {

  const position = useProp(props.position, parsePosition);
  const color = useProp(props.color, parseColor);
  const intensity = useProp(props.intensity, parseNumber, 1);
  const cutoff = Math.pow(useProp(props.cutoff, parseNumber, 0.01), 1/2.2);

  const {shadowMap} = props;
  const parent = useMatrixContext();

  const [into, shadow] = useMemo(() => {
    if (!shadowMap) return [null, null];

    const size  = parseVec2(shadowMap.size  ?? DEFAULT_SHADOW_MAP.size);
    const depth = parseVec2(shadowMap.depth ?? DEFAULT_SHADOW_MAP.depth);
    const bias  = parseVec3(shadowMap.bias  ?? DEFAULT_SHADOW_MAP.bias);
    const blur  = parseNumber(shadowMap.blur ?? DEFAULT_SHADOW_MAP.blur);

    const matrix = mat4.create();
    mat4.fromTranslation(matrix, position as vec3);

    if (parent) mat4.multiply(matrix, parent, matrix);

    mat4.invert(matrix, matrix);

    const shadow = {type: 'omni', size, depth, bias, blur};
    return [matrix, shadow];
  }, [position, shadowMap, parent]);

  const light = useMemo(() => {
    const p = vec4.clone(position as any as vec4);
    if (parent) vec3.transformMat4(p as vec3, p as vec3, parent);
    p[3] = 1;

    return {
      kind: POINT_LIGHT,
      into,
      position: p,
      color,
      cutoff,
      intensity,
      shadow,
    };
  }, [position, color, intensity, shadow, parent]);

  const {useLight} = useLightContext();
  useLight(light);

  if (!props.debug) return null;

  return use(PointHelper, { position, color });
}, 'PointLight');
