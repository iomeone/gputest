import type {
  ArrowFunction, TypedArray, TensorArray, TypedArrayConstructor,
  Blending, VectorLike, ArrayLike, ColorLike, ColorLikes, Side, VectorLikes,
} from '@use-gpu/core';
import type { Parser, Join, PointShape, Domain } from './types';
import { mat4, vec4, vec3, vec2, quat } from 'gl-matrix';
import { toScalarArray, toVectorArray, toMultiVectorArray, toMultiScalarArray, toMultiMultiVectorArray } from './flatten';

const NO_VEC2 = vec2.fromValues(0, 0);
const NO_VEC3 = vec3.fromValues(0, 0, 0);
const NO_VEC4 = vec4.fromValues(0, 0, 0, 0);
const NO_QUAT = quat.create();
const NO_MAT4 = mat4.create();

const NO_POSITION = vec4.fromValues(0, 0, 0, 1);

const GRAY = vec4.fromValues(0.5, 0.5, 0.5, 1);

const NO_STRINGS: string[] = [];

const NO_RANGE = vec2.fromValues(-1, 1);
const NO_RANGES = [NO_RANGE, NO_RANGE, NO_RANGE, NO_RANGE];

const AXIS_NUMBERS = {'x': 0, 'y': 1, 'z': 2, 'w': 3} as Record<string, number>;
const AXIS_LETTERS = Object.keys(AXIS_NUMBERS);

const u4ToFloat = (s: string) => parseInt(s, 16) / 15;
const u8ToFloat = (s: string) => parseInt(s, 16) / 255;
const strToFloat = (s: string) => s.match('%') ? +s / 100 : +s;

///////////////////////////

export const isTypedArray = (() => {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return (obj: any) => obj instanceof TypedArray;
})();

///////////////////////////

export const makeParseObject = <T extends object>() => (value?: T): T => {
  if (typeof value === 'object' && value != null) return value;
  throw new Error(`Expected object, got: '${JSON.stringify(value)}'`);
};

export const makeParseArray = <T>(
  defaults: T[],
  parse: (v: any) => T
) => (vecs?: ArrayLike[]): T[] => {
  if (vecs != null) {
    const vs = vecs.map(parse);
    const l = vs.length;
    const n = defaults.length;
    if (l < n) for (let i = l; i < n; ++i) vs.push(defaults[i]);
    return vs;
  }
  return defaults;
};

export const makeParseEnum = <T>(
  options: T[],
): ((s?: string) => T) => {
  const hash = new Set(options);
  const [def] = options;

  return (s?: string): T => {
    if (s != null) {
      if (hash.has(s as any)) return s as any as T;
      else console.warn(`Unknown enum value '${s}'`);
    }
    return def;
  };
};

export const makeParseMap = <T>(map: Record<string, T>, def: string) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (s?: string) => map[s as any] ?? map[def]!;
};

export const makeParseMapOrValue = <T>(map: Record<string, T>, def: string): ((s?: string | T) => T) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (s?: string | T) => map[s as any] ?? (s as any as T) ?? map[def]!;
};

///////////////////////////

export const makeParseVec2 = (defaults: vec2 = NO_VEC2) => (vec?: VectorLike): vec2 => {
  if (vec != null) {
    return vec2.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1]);
  }
  return defaults;
};

export const makeParseVec3 = (defaults: vec3 = NO_VEC3) => (vec?: VectorLike): vec3 => {
  if (vec != null) {
    return vec3.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1], vec[2] ?? defaults[2]);
  }
  return defaults;
};

export const makeParseVec4 = (defaults: vec4 = NO_VEC4) => (vec?: VectorLike): vec4 => {
  if (vec != null) {
    return vec4.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1], vec[2] ?? defaults[2], vec[3] ?? defaults[3]);
  }
  return defaults;
};

export const makeParseMat4 = (defaults: mat4 = NO_MAT4) => (matrix?: VectorLike): mat4 => {
  if (matrix != null) {
    // @ts-ignore
    return mat4.fromValues(...matrix);
  }
  return defaults;
};

export const makeParseScalarArray = <T extends TypedArrayConstructor>(
  constructor: T,
) => (
  vec: VectorLike | TensorArray
): InstanceType<T> => {
  return (toScalarArray(vec, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseScalarArrayLike = <T extends TypedArrayConstructor>(
  constructor: T,
) => (
  vec: number | VectorLike | TensorArray,
): number | InstanceType<T> => {
  if (typeof vec === 'number') return vec;
  return (toScalarArray(vec, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseMultiScalarArray = <T extends TypedArrayConstructor>(
  constructor: T,
) => (
  vecs: VectorLikes | TensorArray
): InstanceType<T> => {
  return (toMultiScalarArray(vecs, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseVectorArray = <T extends TypedArrayConstructor>(
  dims: number,
  w: number = 0,
  constructor: T,
) => (
  vecs: VectorLikes | TensorArray
): InstanceType<T> => {
  return (toVectorArray(vecs, dims, w, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseMultiVectorArray = <T extends TypedArrayConstructor>(
  dims: number,
  w: number = 0,
  constructor: T,
) => (
  vecs: VectorLikes | VectorLikes[] | TensorArray
): InstanceType<T> => {
  return (toMultiVectorArray(vecs, dims, w, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseMultiMultiVectorArray = <T extends TypedArrayConstructor>(
  dims: number,
  w: number = 0,
  constructor: T,
) => (
  vecs: VectorLikes | VectorLikes[] | VectorLikes[][] | TensorArray
): InstanceType<T> => {
  return (toMultiMultiVectorArray(vecs, dims, w, constructor) ?? new constructor(0)) as InstanceType<T>;
};

export const makeParseBasis = (defaults: string | number[], min: number = defaults.length) => {
  const defs = typeof defaults === 'string' ? defaults : defaults.map(i => AXIS_LETTERS[i]).join('');

  const getOrder = (basis: number[]): string => {
    // Fill out incomplete basis, e.g. 'yx' -> 'yxzw'
    const max = Math.max(min, basis.reduce((a, b) => Math.max(a, b), 0));
    const rest = [];
    if (basis.length < max) for (let i = 0; i < max; ++i) {
      if (!basis.includes(i)) rest.push(i);
    }
    return [...basis, ...rest].map(i => AXIS_LETTERS[i]).join('');
  };

  return (s?: string | number[]): string => {
    if (s != null) {
      if (typeof s === 'string') return getOrder(s.split('').map(letter => AXIS_NUMBERS[letter]).filter(n => n != null));
      return getOrder(s);
    }
    return defs;
  };
};

export const parseRotation = (vec?: VectorLike | number): vec3 => {
  if (vec != null) {
    if (typeof vec === 'number') return vec3.fromValues(0, 0, vec);
    if (vec.length === 1) return vec3.fromValues(0, 0, vec[0]);
    return vec3.fromValues(vec[0] ?? 0, vec[1] ?? 0, vec[2] ?? 0);
  }
  return vec3.fromValues(0, 0, 0);
};

export const parseScale = (vec?: VectorLike | number): vec3 => {
  if (vec != null) {
    if (typeof vec === 'number') return vec3.fromValues(vec, vec, vec);
    if (vec.length === 1) return vec3.fromValues(vec[0], vec[0], vec[0]);
    return vec3.fromValues(vec[0] ?? 1, vec[1] ?? 1, vec[2] ?? 1);
  }
  return vec3.fromValues(1, 1, 1);
};

///////////////////////////

export const clampNumber = (
  min: number | null,
  max: number | null,
) => (
  parse: Parser<number | undefined, number>,
) => (
  value?: number,
) => {
  let v = parse(value);
  if (min != null) v = Math.max(min, v);
  if (max != null) v = Math.min(max, v);
  return v;
};

///////////////////////////

export const parseObject = <T>(value?: T) => typeof value === 'object' && value != null ? value : {};
export const parseString = (s?: string) => s ?? '';
export const parseNumberLike = (value?: number | TypedArray) => +(Array.isArray(value) ? value[0] : value) || 0;
export const parseNumber = (value?: number) => parseNumberLike(value);
export const parseInteger = (value?: number) => Math.round(parseNumberLike(value));
export const parseBoolean = (value?: boolean) => !!value;

export const parseNumberUnsigned = clampNumber(0, null)(parseNumber);
export const parseNumberPositive = clampNumber(1, null)(parseNumber);
export const parseIntegerPositive = clampNumber(1, null)(parseInteger);

export const parseVec2 = makeParseVec2();
export const parseVec3 = makeParseVec3();
export const parseVec4 = makeParseVec4();

export const parseStringFormatter = (s: ArrowFunction | string): ArrowFunction => {
  if (typeof s === 'function') return s;
  return (s?: string) => '' + s;
};

export const parseAxis = (s?: string) => {
  if (s != null) return AXIS_NUMBERS[s] ?? 0;
  return 0;
};

export const parseColorOpacity = (color?: ColorLike, opacity: number = 1): vec4 => {
  const def = GRAY;

  const c = color as any;
  // eslint-disable-next-line no-empty
  if (c == null) {}
  else if (typeof c === 'string') {
    if (c[0] === '#') {
      if (c.length === 4) {
        const r = u4ToFloat(c[1]);
        const g = u4ToFloat(c[2]);
        const b = u4ToFloat(c[3]);
        return vec4.fromValues(r, g, b, opacity);
      }
      if (c.length === 7) {
        const r = u8ToFloat(c.slice(1, 3));
        const g = u8ToFloat(c.slice(3, 5));
        const b = u8ToFloat(c.slice(5, 7));
        return vec4.fromValues(r, g, b, opacity);
      }
      if (c.length === 9) {
        const r = u8ToFloat(c.slice(1, 3));
        const g = u8ToFloat(c.slice(3, 5));
        const b = u8ToFloat(c.slice(5, 7));
        const a = u8ToFloat(c.slice(7, 9));
        return vec4.fromValues(r, g, b, a * opacity);
      }
    }
    if (c[0] === 'r') {
      const cs = c.split('(')[1].split(')')[0].split(',').map(strToFloat);
      if (c[3] === 'a') return vec4.fromValues(cs[0] / 255, cs[1] / 255, cs[2] / 255, cs[3] * opacity);
      else return vec4.fromValues(cs[0] / 255, cs[1] / 255, cs[2] / 255, opacity);
    }
  }
  else if (c.rgba ?? c.rgb) {
    const [r, g, b, a] = c.rgba ?? c.rgb;
    return vec4.fromValues(r / 255, g / 255, b / 255, (a ? a / 255 : 1) * opacity);
  }
  else if (c.length) {
    return vec4.fromValues(c[0] ?? def[0], c[1] ?? def[1], c[2] ?? def[2], (c[3] ?? def[3]) * opacity);
  }
  else {
    throw new Error(`Cannot parse color ${color}`);
  }

  if (opacity === 1) return def;
  return vec4.fromValues(def[0], def[1], def[2], def[3] * opacity);
};

export const parseColor = (color?: ColorLike) => parseColorOpacity(color);

//////////////////

export const parseStringArray = makeParseArray(NO_STRINGS, parseString);

export const parseBooleanArray = (vec: VectorLike | boolean[]): Uint8Array =>
  vec ? toScalarArray(vec as VectorLike, Uint8Array) as any as Uint8Array : new Uint8Array();

export const parseBooleanArrayLike = (vec: VectorLike | boolean | boolean[]): Uint8Array | boolean =>
  typeof vec === 'boolean' ? vec : vec ? toScalarArray(vec as VectorLike, Uint8Array) as any as Uint8Array : new Uint8Array();

export const parseColorArray = (colors: ColorLikes | TensorArray): Float32Array => {
  const cs = colors as any;
  if (isTypedArray(cs)) return cs as Float32Array;
  if (isTypedArray(cs?.array)) return cs.array;
  const parsed = cs ? cs.map(parseColor) : [];
  return parseVec4Array(parsed);
};

export const parseColorArrayLike = (colors: ColorLikes | TensorArray | string): Float32Array => {
  const cs = colors as any;
  if (isTypedArray(cs)) return cs as Float32Array;
  if (isTypedArray(cs?.array)) return cs.array;
  if (Array.isArray(cs) && typeof cs[0] !== 'number') {
    return parseVec4Array(cs.map(parseColor));
  }
  return parseColor(cs) as Float32Array;
};

export const parseColorMultiArray = (colors: ColorLikes | ColorLikes[] | TensorArray): Float32Array => {
  const cs = colors as any;
  if (isTypedArray(cs)) return colors as Float32Array;
  if (isTypedArray(cs?.array)) return cs.array;
  if (Array.isArray(cs) && Array.isArray(cs[0]) && typeof cs[0][0] !== 'number') {
    return parseVec4MultiArray((cs as ColorLike[][]).map(cs => cs.map(parseColor)));
  }
  return parseVec4Array(cs.map(parseColor));
};

export const parseIntegerArray    = makeParseScalarArray(Int32Array);

export const parseScalarArray     = makeParseScalarArray(Float32Array)
export const parseScalarArrayLike = makeParseScalarArrayLike(Float32Array);
export const parseMultiScalarArray = makeParseMultiScalarArray(Float32Array);

export const parseVec2Array = makeParseVectorArray(2, 0, Float32Array);
export const parseVec3Array = makeParseVectorArray(3, 0, Float32Array);
export const parseVec4Array = makeParseVectorArray(4, 0, Float32Array);

export const parseVec4MultiArray = makeParseMultiVectorArray(4, 0, Float32Array);

//////////////////

export const parsePosition   = makeParseVec4(NO_POSITION);
export const parseQuaternion = makeParseVec4(NO_QUAT);
export const parseMatrix     = makeParseMat4();

export const parsePositionArray = makeParseVectorArray(4, 1, Float32Array);
export const parsePositionMultiArray = makeParseMultiVectorArray(4, 1, Float32Array);
export const parsePositionMultiMultiArray = makeParseMultiMultiVectorArray(4, 1, Float32Array);

export const parseSide       = makeParseEnum<Side>(['front', 'back', 'both']);

export const parseJoin       = makeParseEnum<Join>(['bevel', 'miter', 'round']);
export const parseBlending   = makeParseEnum<Blending>(['none', 'premultiply', 'alpha', 'add', 'subtract', 'multiply']);

export const parsePlacement  = makeParseMap({
  'center':      vec2.fromValues( 0,  0),
  'left':        vec2.fromValues( 1,  0),
  'top':         vec2.fromValues( 0,  1),
  'right':       vec2.fromValues(-1,  0),
  'bottom':      vec2.fromValues( 0, -1),
  'topLeft':     vec2.fromValues( 1,  1),
  'topRight':    vec2.fromValues(-1,  1),
  'bottomLeft':  vec2.fromValues( 1, -1),
  'bottomRight': vec2.fromValues(-1, -1),
}, 'center');

export const parseWeight = makeParseMapOrValue({
  'thin': 100,
  'extra-light': 200,
  'light': 300,
  'normal': 400,
  'medium': 500,
  'semi-bold': 600,
  'bold': 700,
  'extra-bold': 800,
  'black': 900,
  'extra-black': 900,
}, 'normal');

export const parseAxes   = makeParseBasis('xyzw');
export const parseRange  = makeParseVec2(NO_RANGE);
export const parseRanges = makeParseArray(NO_RANGES, parseRange);

export const parseDomain = makeParseEnum<Domain>(['linear', 'log']);
export const parsePointShape = makeParseEnum<PointShape>([
  'circle',
  'diamond',
  'square',
  'up',
  'down',
  'left',
  'right',
]);
