import { mat4, vec4, vec3, vec2 } from 'gl-matrix';

export const AMBIENT_LIGHT = 0;
export const DIRECTIONAL_LIGHT = 1;
export const DOME_LIGHT = 2;
export const POINT_LIGHT = 3;

export type Light = {
  into?: mat4 | null,
  position?: vec4 | null,
  normal?: vec4 | null,
  color?: vec4 | null,
  opts?: vec4 | null,
  intensity?: number | null,
  cutoff?: number | null,
  kind: number,

  shadow?: ShadowMapProps | null,
};

export type BoundLight = Light & {
  id?: number,
  shadowType?: 'ortho',
  shadowMap?: number,
  shadowUV?: vec4,
  shadowBias?: vec3,
  shadowDepth?: vec2,
  shadowBlur?: number,
};

export type ShadowMapProps = {
  type: string,
  size: vec2,
  depth: vec2,
  bias: vec3,
  blur: number,
};

export type ShadowMapLike = {
  size?: vec2 | [number, number] | number[],
  depth?: vec2 | [number, number] | number[],
  bias?: vec2 | [number, number] | number[],
  span?: vec2 | [number, number] | number[],
  up?: vec3 | [number, number, number] | number[],
  blur?: number,
};
