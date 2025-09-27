import { ArrowFunction } from '@use-gpu/live';
import { LineTrait, ColorTrait, ROPTrait, ArrowTrait, ScaleTrait, Domain, Join, Blending, Color, Placement, Flip, TypedArray, ColorLike, VectorLike, ArrayLike, PointShape } from '../types';
import { mat4, vec4, vec3, vec2, quat } from 'gl-matrix';

const NO_VEC2 = vec2.fromValues(0, 0);
const NO_VEC3 = vec3.fromValues(0, 0, 0);
const NO_VEC4 = vec4.fromValues(0, 0, 0, 0);
const NO_QUAT = quat.fromValues(0, 0, 0);
const NO_MAT4 = mat4.create();

const GRAY = [0.5, 0.5, 0.5, 1];

const NO_RANGE = vec2.fromValues(-1, 1);
const NO_RANGES = [NO_RANGE, NO_RANGE, NO_RANGE, NO_RANGE];

const NO_VECTOR: number[] = [];
const NO_STRINGS: string[] = [];

///////////////////////////

export const optional = <A, B>(parse: (t?: A) => B) => (t?: A): B | undefined => t !== undefined ? parse(t) : undefined;

///////////////////////////

export const makeParseFloat = (def: number = 0, min?: number, max?: number) => (value?: number) => {
  if (value != null) {
    if (min != null) value = Math.max(min, value);
    if (max != null) value = Math.min(max, value);
    return +value;
  }
  return def;
};

export const makeParseInt = (def: number = 0, min?: number, max?: number) => (value?: number) => {
  if (value != null) {
    value = Math.round(value);
    if (min != null) value = Math.max(min, value);
    if (max != null) value = Math.min(max, value);
    return value;
  }
  return def;
};

export const makeParseBoolean = (def: boolean = false) => (value?: number | boolean) => {
  if (value != null) {
    return !!value;
  }
  return def;
};

export const makeParseVec2 = (defaults: VectorLike = NO_VEC2) => (vec?: VectorLike): vec2 => {
  if (vec != null) {
    return vec2.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1]);
  }
  return defaults;
};

export const makeParseVec3 = (defaults: VectorLike = NO_VEC3) => (vec?: VectorLike): vec3 => {
  if (vec != null) {
    return vec3.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1], vec[2] ?? defaults[2]);
  }
  return defaults;
};

export const makeParseVec4 = (defaults: VectorLike = NO_VEC4) => (vec?: VectorLike): vec4 => {
  if (vec != null) {
    return vec4.fromValues(vec[0] ?? defaults[0], vec[1] ?? defaults[1], vec[2] ?? defaults[2], vec[3] ?? defaults[3]);
  }
  return defaults;
};

export const makeParseMat4 = () => (matrix?: VectorLike): mat4 => {
  if (matrix != null) {
    return mat4.fromValues(...matrix);
  }
  return NO_MAT4;
};

export const makeParseArray = <T>(
  defaults: T[],
  parse: (v: ArrayLike) => T
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

export const makeParseEnum = (
  options: string[],
) => {
  const hash = new Set(options);
  const [def] = options;

  return (s?: string): string => {
    if (s != null && hash.has(s)) return s;
    return def;
  };
};

export const makeParseString = (
  defaults: string = '',
) => {
  return (s?: string): string => {
    if (s != null) return s;
    return defaults;
  };
};

export const makeParseStringFormatter = (
  defaults: string = '',
) => {
  return (s?: ArrowFunction): ArrayFunction => {
    if (typeof s === 'function') return s;
    return (s?: string) => '' + s;
  };
};

const AXIS_NUMBERS = {'x': 0, 'y': 1, 'z': 2, 'w': 3} as Record<string, number>;
const AXIS_LETTERS = ['x', 'y', 'z', 'w'];

export const makeParseAxis = (def: number) => (s?: string) => {
  if (s != null) return AXIS_NUMBERS[s] ?? def;
  return def;
};

export const makeParseBasis = (defaults: string) => {
  const axes = defaults.split('');
  const order = [0, 1, 2, 3];

  const getOrder = (s: string) => {
    order.sort((a, b) => {
      const ai = s.indexOf(axes[a]);
      const bi = s.indexOf(axes[b]);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai < 0 && bi < 0) return a - b;
      return (ai < 0) ? 1 : -1;
    });
    return order.map(x => AXIS_LETTERS[x]).join('');
  };

  return (s?: string) => {
    if (s != null) return getOrder(s);
    return defaults;
  }
};

const u4ToFloat = (s: string) => parseInt(s, 16) / 15;
const u8ToFloat = (s: string) => parseInt(s, 16) / 255;

export const makeParseColor = (def: Color = GRAY) => (c?: ColorLike): Color => {
  if (c === +c) {
    const r = ((c >> 16) & 255) / 255;
    const g = ((c >> 8) & 255) / 255;
    const b = ((c & 255)) / 255;
    return [r, g, b, 1];
  }
  if (typeof c === 'string') {
    if (c[0] === '#') {
      if (c.length === 4) {
        const r = u4ToFloat(c[1]);
        const g = u4ToFloat(c[2]);
        const b = u4ToFloat(c[3]);
        return [r, g, b, 1];
      }
      if (c.length === 7) {
        const r = u8ToFloat(c.slice(1, 3));
        const g = u8ToFloat(c.slice(3, 5));
        const b = u8ToFloat(c.slice(5, 7));
        return [r, g, b, 1];
      }
    }
    if (c[0] === 'r') {
      throw new Error("Use {rgb:[r,g,b]} or rgba:[r,g,b,a]} to specify RGB(A) colors.")
    }
  }
  if (c.rgba ?? c.rgb) {
    const [r, g, b, a] = c.rgba ?? c.rgb;
    return [r / 255, g / 255, b / 255, a ? a / 255 : 1];
  }
  if (c.length) {
    return [c[0] ?? def[0], c[1] ?? def[1], c[2] ?? def[2], c[3] ?? def[3] ];
  }
  return def;
};

export const makeParseMap = <T>(map: Record<string, T>, def: string) => {
  return (s: string) => map[s] ?? map[def]!;
};

export const makeParseMapOrValue = <T>(map: Record<string, T>, def: string): T => {
  return (s: string | T) => map[s] ?? (s as any as T) ?? map[def]!;
};

//////////////////

export const parseColor      = makeParseColor();

export const parseFloat      = makeParseFloat();
export const parseInteger    = makeParseInt();
export const parseBoolean    = makeParseBoolean();

export const parseString          = makeParseString();
export const parseStringFormatter = makeParseStringFormatter();
export const parseStringArray     = makeParseArray(NO_STRINGS, parseString);

export const parseVector     = makeParseArray(NO_VECTOR, parseFloat);

export const parsePosition4  = makeParseVec4();

export const parsePosition   = makeParseVec3();
export const parseRotation   = makeParseVec3();
export const parseQuaternion = makeParseVec3();
export const parseScale      = makeParseVec3(1, 1, 1);
export const parseMatrix     = makeParseMat4();

export const parseRange      = makeParseVec2(NO_RANGE);
export const parseRanges     = makeParseArray(NO_RANGES, parseRange);

export const parseAxes       = makeParseBasis('xyzw');
export const parseAxis       = makeParseAxis(0);

export const parseDetail     = makeParseInt(1, 1, 1e8);

export const parseDomain     = makeParseEnum<Domain>(['linear', 'log']);
export const parseJoin       = makeParseEnum<Join>(['bevel', 'miter', 'round']);
export const parseBlending   = makeParseEnum<Blending>(['none', 'normal', 'add', 'subtract', 'multiply', 'custom']);

export const parseFlip       = makeParseMap({
  'none':    0,
  'outside': 1,
  'inside': -1,
}, 'none');

export const parsePlacement  = makeParseMap({
  'center':      vec2.fromValues(0,  0),
  'left':        vec2.fromValues(1,  0),
  'top':         vec2.fromValues(0, -1),
  'right':       vec2.fromValues(1,  0),
  'bottom':      vec2.fromValues(0,  1),
  'topLeft':     vec2.fromValues(1, -1),
  'topRight':    vec2.fromValues(1, -1),
  'bottomLeft':  vec2.fromValues(1,  1),
  'bottomRight': vec2.fromValues(1, -1),
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
  'ultra-bold': 900,
}, 'normal');

export const parsePointShape = makeParseEnum<PointShape>(['circle', 'diamond', 'square', 'circleOutlined', 'diamondOutlined', 'squareOutlined'])