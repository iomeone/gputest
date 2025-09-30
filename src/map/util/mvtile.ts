import type { ArchetypeSchema, AggregateItem, ColorLike, FieldArray, TypedArray, VectorEmitter, VectorLike, XY, XYZW } from '@use-gpu/core';
import type { SegmentDecorator } from '@use-gpu/workbench';
import type { MVTStyleSheet, MVTStyleProperties } from '../types';
import type { VectorTile } from 'mapbox-vector-tile';

import {
  adjustSchema,
  allocateSchema,
  schemaToEmitters,
  emitAttributes,

  copyRecursiveNumberArray,
  toCPUDims,
} from '@use-gpu/core';

import { toChunkCounts } from '@use-gpu/parse';

import { cutPolygons, clipTileEdges } from './tesselate';

import { getLineSegments, getFaceSegmentsConcave, POINT_SCHEMA, LINE_SCHEMA, FACE_SCHEMA } from '@use-gpu/workbench';

const POS = {positions: 'vec2<f32>'};
const SCHEMAS = {
  point: adjustSchema(POINT_SCHEMA, POS),
  line:  adjustSchema(LINE_SCHEMA, POS),
  face:  adjustSchema(FACE_SCHEMA, POS),
};

type Vec2 = {x: number, y: number};

export type MVTShapes = {
  point?: MVTPoint,
  line?: MVTLine,
  ring?: MVTLine,
  face?: MVTFace,
};

export type MVTAggregates = {
  point?: MVTAggregate,
  line?: MVTAggregate,
  ring?: MVTAggregate,
  face?: MVTAggregate,
};

export type MVTAggregate = AggregateItem;

export type MVTShape = {
  positions: any,
  color: ColorLike[],
  depth: number[],
  zBias: number[],
};

export type MVTPoint = MVTShape & {
  positions: XY[][],
  size: number[],
};

export type MVTLine = MVTShape & {
  positions: XY[][],
  width: number[],
};

export type MVTFace = MVTShape & {
  positions: XY[][][],
};

export const getMVTShapes = (
  x: number, y: number, zoom: number,
  mvt: VectorTile,
  styles: MVTStyleSheet,
  flipY: boolean,
  tesselate: number = 0,
): MVTShapes => {
  const z = Math.pow(2, zoom);
  const iz = 1 / z

  const ox = x * iz;
  const oy = y * iz;

  const {layers} = mvt;

  const shapes: Required<MVTShapes> = {
    point: {
      positions: [],
      color: [],
      size: [],
      depth: [],
      zBias: [],
    },
    line: {
      positions: [],
      color: [],
      width: [],
      depth: [],
      zBias: [],
    },
    ring: {
      positions: [],
      color: [],
      width: [],
      depth: [],
      zBias: [],
    },
    face: {
      positions: [],
      color: [],
      depth: [],
      zBias: [],
    },
  };

  const addPoint = (
    geometry: Vec2[],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    transform: (x: number, y: number) => XY,
  ) => {
    const positions = geometry.map(({x, y}: Vec2) => transform(x, y));
    if (style.point) {
      if (properties.name) {
        /*
        shapes.label.push({
          position: positions,
          text: properties.name,
          color: style.point.color,
        });
        */
      }
      else {
        shapes.point.positions.push(positions);
        shapes.point.color.push(style.point.color);
        shapes.point.size.push(style.point.size);
        shapes.point.depth.push(style.point.depth);
        shapes.point.zBias.push(style.point.zBias);
      }
    }
  }

  const addLine = (
    geometry: Vec2[][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    transform: (x: number, y: number) => XY,
  ) => {
    const positions = geometry.map((path) => path.map(({x, y}: Vec2) => transform(x, y)));

    if (properties.name) {
      /*
      shapes.label.push({
        positions,
        text: properties.name,
        color: style.line.color,
      });
      */
    }
    else {
      shapes.line.positions.push(...positions);

      const n = geometry.length;
      for (let i = 0; i < n; ++i) {
        shapes.line.color.push(style.line.color);
        shapes.line.width.push(style.line.width);
        shapes.line.depth.push(style.line.depth);
        shapes.line.zBias.push(style.line.zBias);
      }
    }
  }

  const addPolygon = (
    geometry: XY[][][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    extent: number,
    transform: (x: number, y: number) => XY,
  ) => {
    const originalGeometry = geometry;
    if (tesselate > 0) geometry = tesselateGeometry(geometry, [0, 0, extent, extent], tesselate);

    if (style.face?.fill) {
      const positions = geometry.map(polygon => polygon.map((ring: XY[]) => ring.map(([x, y]: XY) => transform(x, y))));

      shapes.face.positions.push(...positions);
      const n = geometry.length;
      for (let i = 0; i < n; ++i) {
        shapes.face.color.push(style.face.fill);
        shapes.face.depth.push(style.face.depth);
        shapes.face.zBias.push(style.face.zBias);
      }
    }

    if (style.face?.stroke) {
      const {rings, lines} = clipTileEdges(originalGeometry, 0, 0, extent, extent);
      if (rings.length) {
        const positions = rings.map((path: XY[]) => path.map(([x, y]: XY) => transform(x, y)));
        shapes.ring.positions.push(...positions);
        
        const n = positions.length;
        for (let i = 0; i < n; ++i) {
          shapes.ring.color.push(style.face.stroke);
          shapes.ring.width.push(style.face.width);
          shapes.ring.depth.push(style.face.depth);
          shapes.ring.zBias.push(style.face.zBias + 1);
        }
      }
      if (lines.length) {
        const positions = lines.map((path: XY[]) => path.map(([x, y]: XY) => transform(x, y)));
        shapes.line.positions.push(...positions);

        const n = positions.length;
        for (let i = 0; i < n; ++i) {
          shapes.line.color.push(style.face.stroke);
          shapes.line.width.push(style.face.width);
          shapes.line.depth.push(style.face.depth);
          shapes.line.zBias.push(style.face.zBias + 1);
        }
      }
    }
  };

  const transformGlobal = (x: number, y: number): XY => [
    (( ox + iz * x/256) * 2 - 1),
    (((oy + iz * y/256) * 2 - 1) * (flipY ? -1 : 1)),
  ];
  const style = styles['background'];
  if (style) {
    addPolygon([[[[0, 0], [256, 0], [256, 256], [0, 256]]]], {}, style, 256, transformGlobal);
  }

  //const unstyled: string[] = [];

  for (const k in layers) {
    const layer = layers[k];
    const {length, name} = layer;

    //console.log("layer", name, layer, length)

    for (let i = 0; i < length; ++i) {
      const feature = layer.feature(i);
      const {type: t, properties, extent} = feature;

      const klass = properties['class'] as any as string;

      const ownStyles = styles[name + '/'+ klass] ?? styles[name] ?? styles[klass];
      const style = ownStyles ?? styles.default;

      //if (!ownStyles) unstyled.push(`${klass}/${name} ${t}`);

      const transformTile = (x: number, y: number): XY => [
        (( ox + iz * (x / extent)) * 2 - 1),
        (((oy + iz * (y / extent)) * 2 - 1) * (flipY ? -1 : 1)),
      ];

      if (t === 1) {
        const geometry = feature.asPoints();
        if (geometry) addPoint(geometry, properties, style, transformTile);
      }
      else if (t === 2) {
        const geometry = feature.asLines();
        if (geometry) addLine(geometry, properties, style, transformTile);
      }
      else if (t === 3) {
        const poly = feature.asPolygons();
        if (!poly) continue;

        let geometry = poly.map((polygon: Vec2[][]) => polygon.map((ring: Vec2[]) => {
          const r = ring.map((({x, y}): XY => [x, y]));
          r.pop();
          return r;
        }));

        geometry = cutPolygons(geometry, 1, 0, 0);
        geometry = cutPolygons(geometry, 0, 1, 0);
        geometry = cutPolygons(geometry, -1, 0, -extent);
        geometry = cutPolygons(geometry, 0, -1, -extent);

        addPolygon(geometry, properties, style, extent, transformTile);
      }
    }
  }

  const s = shapes as MVTShapes;
  if (!shapes.point.positions.length) delete s.point;
  if (!shapes.line.positions.length)  delete s.line;
  if (!shapes.ring.positions.length)  delete s.ring;
  if (!shapes.face.positions.length)  delete s.face;

  return s;
};

export const aggregateMVTShapes = (shapes: MVTShapes): MVTAggregates => {
  const out: MVTAggregates = {};

  if (shapes.point) out.point = aggregateMVTShape(shapes.point, SCHEMAS.point);
  if (shapes.line) out.line = aggregateMVTShape(shapes.line, SCHEMAS.line, getLineSegments);
  if (shapes.ring) out.ring = aggregateMVTShape(shapes.ring, SCHEMAS.line, getLineSegments, true);
  if (shapes.face) out.face = aggregateMVTShape(shapes.face, SCHEMAS.face, getFaceSegmentsConcave);

  return out;
};

const aggregateMVTShape = (
  shape: MVTShape,
  schema: ArchetypeSchema,
  segments?: SegmentDecorator,
  loop?: boolean,
  start?: boolean,
  end?: boolean,
) => {
  const {positions} = shape;
  const [chunks, groups] = toChunkCounts(positions, 2);

  const itemCount = positions.length;
  const dataCount = (chunks as number[]).reduce((a, b) => a + b, 0);

  // Make arrays for merged attributes
  const {fields, attributes, archetype} = allocateSchema(
    schema,
    itemCount,
    dataCount,
    0,
    true,
    (key: string) => !!(shape as any)[key],
  );

  const slices = [];

  // Blit all data into merged arrays
  for (const k in fields) {
    const {array, dims, depth = 0, prop = k} = fields[k];
    const slice = k === 'positions';

    const dimsIn = toCPUDims(dims);

    let b = 0;
    let o = 0;
    
    if (slice) {
      for (let i = 0; i < itemCount; ++i) {
        const from = (shape as any)[prop][i];
        o += copyRecursiveNumberArray(from, array, dimsIn, dimsIn, depth - 1, o, 1);
        if (slice) slices.push((o - b) / dimsIn + ((loop === true) ? 3 : 0));
        b = o;
      }
    }
    else {
      copyRecursiveNumberArray((shape as any)[prop], array, dimsIn, dimsIn, 1, 0, 1);
    }
  }

  // Get emitters for data + segment data
  const [, emitted, count, indexed] = decorateMVTSegments(
    fields.positions,
    {...attributes, slices: slices as any},
    schema,
    dataCount,
    chunks,
    groups,
    segments,
    loop,
    start,
    end,
  );
  const instanced = itemCount;

  // Make aggregate chunk
  const item = {
    count,
    indexed,
    instanced,
    slices,
    archetype,
    attributes: emitted,
  };

  return item;
};

const decorateMVTSegments = (
  positions: FieldArray,
  attributes: Record<string, TypedArray>,
  schema: ArchetypeSchema,
  count: number,
  chunks: VectorLike,
  groups: VectorLike | null,
  segments?: SegmentDecorator,
  loops: boolean[] | boolean = false,
  starts: boolean[] | boolean = false,
  ends: boolean[] | boolean = false,
): [
  ArchetypeSchema,
  Record<string, TypedArray | VectorEmitter>,
  number,
  number,
  number,
] => {  
  if (!segments) {
    const emitters = schemaToEmitters(schema, attributes);
    const emitted = emitAttributes(schema, emitters, 1, count, 0);
    return [schema, emitted, count, 0, 0];
  }

  const {array, dims} = positions;

  const segmentData = segments({
      chunks,
      groups,
      positions: array,
      dims: toCPUDims(dims),
      loops,
      starts,
      ends,
  });

  const {count: total, indexed, sparse, schema: segmentSchema, ...rest} = segmentData;

  const mergedSchema = {...schema, ...segmentSchema};
  const emitters = schemaToEmitters(mergedSchema, {...attributes, ...rest});
  const emitted = emitAttributes(schema, emitters, 1, total, indexed);
  
  return [mergedSchema, emitted, total, indexed, sparse];
};

const tesselateGeometry = (polygons: XY[][][], [l, t, r, b]: XYZW, limit: number = 1, depth: number = 0): XY[][][] => {
  const x = (l + r) / 2;
  const y = (t + b) / 2;

  const ll: XY[][][] = cutPolygons(polygons, -1, 0, -x);
  const rr: XY[][][] = cutPolygons(polygons,  1, 0,  x);

  const tl: XY[][][] = cutPolygons(ll, 0, -1, -y);
  const tr: XY[][][] = cutPolygons(rr, 0, -1, -y);
  const bl: XY[][][] = cutPolygons(ll, 0,  1,  y);
  const br: XY[][][] = cutPolygons(rr, 0,  1,  y);

  depth++;
  if (depth < limit) {
    return [
      ...tesselateGeometry(tl, [l, t, x, y], limit, depth),
      ...tesselateGeometry(tr, [x, t, r, y], limit, depth),
      ...tesselateGeometry(bl, [l, y, x, b], limit, depth),
      ...tesselateGeometry(br, [x, y, r, b], limit, depth),
    ];
  }

  return [...tl, ...tr, ...bl, ...br];
};
