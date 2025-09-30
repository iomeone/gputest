import type { ArchetypeSchema } from '../../core';
import { isUniformArrayType } from '../../core';

type CompactSchema = {
  single?: string,     // singular prop
  composite?: boolean, // singular is array

  // ArchetypeSchema
  format: string,
  ref?: boolean,
  js?: boolean,
  index?: boolean | (boolean | number)[],
  unwelded?: boolean,
};

const expandArrays = (schema: Record<string, CompactSchema>): ArchetypeSchema => {
  const out: ArchetypeSchema = {};
  for (const k in schema) {
    const {format, single, ref, ...rest} = schema[k];
    const composite = isUniformArrayType(format);
    const array = `array<${format}>`;

    if (ref && single != null) {
      out[single] = { format: array, name: k, ref, ...rest };
      continue;
    }

    out[k] = { format: array, ...rest };
    if (single) {
      if (composite) out[single] = { format, name: k };
      else out[single] = { format, name: k, spread: k, ...rest };
    }
  }
  return out;
};

export const INSTANCE_SCHEMA = expandArrays({
  instances:  {format: 'u32'},
});

export const SHAPE_SCHEMA = expandArrays({
  ids:        {format: 'u32', single: 'id'},
  lookups:    {format: 'u32', single: 'lookup'},
  colors:     {format: 'vec4<f32>', single: 'color'},
  zBiases:    {format: 'f32', single: 'zBias'},
});

export const MATRIX_SCHEMA = expandArrays({
  matrices: {format: 'mat4x4<f32>', single: 'matrix', ref: true},
  normalMatrices: {format: 'mat3x3<f32>', single: 'normalMatrix', ref: true},
});

export const POINT_SCHEMA = {
  ...expandArrays({
    positions: {format: 'vec4<f32>', single: 'position'},
    sizes:     {format: 'f32', single: 'size'},
    depths:    {format: 'f32', single: 'depth'},
  }),
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
};

export const POINT_CLOUD_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
    sizes:     {format: 'f32', single: 'size'},
    depths:    {format: 'f32', single: 'depth'},
  }),
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
};

export const LINE_SEGMENTS_SCHEMA = expandArrays({
  segments:  {format: 'i8', unwelded: true},
});

export const LINE_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
    widths:    {format: 'f32', single: 'width'},
    depths:    {format: 'f32', single: 'depth'},
  }),
  ...LINE_SEGMENTS_SCHEMA,
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
};

export const ARC_SEGMENTS_SCHEMA = expandArrays({
  trims: {format: 'vec2<u32>', unwelded: true, index: true},
});

export const ARC_ANCHORS_SCHEMA = expandArrays({
  anchors: {format: 'vec2<u32>', unwelded: true, index: true},
});

export const ARC_GEOMETRY_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
  }),
  ...ARC_SEGMENTS_SCHEMA,
  ...MATRIX_SCHEMA,
};

export const ARC_LABEL_SCHEMA = {
  ...expandArrays({
    labels:    {format: 'string<u16>', single: 'label', js: true},
    sizes:     {format: 'f32', single: 'size'},
    depths:    {format: 'f32', single: 'depth'},
    expands:   {format: 'f32', single: 'expand'},
    anchors:   {format: 'vec2<u32>', single: 'anchor'},
  }),
  ...SHAPE_SCHEMA,
};

export const ARROW_SEGMENTS_SCHEMA = {
  ...LINE_SEGMENTS_SCHEMA,
  ...expandArrays({
    anchors:   {format: 'vec4<u32>', unwelded: true, index: [1, 1, 1, 0]},
    trims:     {format: 'vec4<u32>', unwelded: true, index: [1, 1, 0, 0]},
  }),
};

export const ARROW_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
    widths:    {format: 'f32', single: 'width'},
    sizes:     {format: 'f32', single: 'size'},
    depths:    {format: 'f32', single: 'depth'},
  }),
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
  ...ARROW_SEGMENTS_SCHEMA,
};

export const FACE_SEGMENTS_SCHEMA = expandArrays({
  segments:  {format: 'i16', unwelded: true},
  indices:   {format: 'u32', index: true},
});

export const FACE_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<array<vec4<f32>>>'},
  }),
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
  ...FACE_SEGMENTS_SCHEMA,
};

export const LABEL_SCHEMA = {
  ...expandArrays({
    positions: {format: 'vec4<f32>', single: 'position'},
    sizes:     {format: 'f32', single: 'size'},
    depths:    {format: 'f32', single: 'depth'},
    expands:   {format: 'f32', single: 'expand'},
    labels:    {format: 'string<u16>', single: 'label', js: true},
  }),
  ...SHAPE_SCHEMA,
  ...MATRIX_SCHEMA,
};

export const SURFACE_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
  }),
  ...SHAPE_SCHEMA,
};

export const TICK_SCHEMA = {
  ...expandArrays({
    positions: {format: 'array<vec4<f32>>'},
    tangents: {format: 'array<vec4<f32>>'},
  }),
  ...SHAPE_SCHEMA,
};

export const DUAL_CONTOUR_SCHEMA = {
  values:  {format: 'array<f32>', separate: true},
  normals: {format: 'array<vec4<f32>>', separate: true},
};

export const UI_SCHEMA = expandArrays({
  rectangles: {format: 'vec4<f32>', single: 'rectangle'},
  radii:      {format: 'vec4<f32>', single: 'radius'},
  borders:    {format: 'vec4<f32>', single: 'border'},
  strokes:    {format: 'vec4<f32>', single: 'stroke'},
  fills:      {format: 'vec4<f32>', single: 'fill'},
  uvs:        {format: 'vec4<f32>', single: 'uv'},
  sts:        {format: 'vec4<f32>', single: 'st'},
  sdfs:       {format: 'vec4<f32>', single: 'sdf'},
  repeats:    {format: 'i8',        single: 'repeat'},
});
