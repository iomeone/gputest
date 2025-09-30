import type { ArchetypeSchema, AggregateItem, ColorLike, FieldArray, TypedArray, VectorEmitter, VectorLike, XY } from '@use-gpu/core';
import type { SegmentDecorator } from '@use-gpu/workbench';
import type { MVTStyleSheet, MVTStyleProperties } from '../types';
import type { VectorTile } from '@mapbox/vector-tile';

import {
  adjustSchema,
  allocateSchema,
  schemaToEmitters,
  emitAttributes,

  copyRecursiveNumberArray,
  toCPUDims,
  seq,
} from '@use-gpu/core';

import { toChunkCounts } from '@use-gpu/parse';

import { cutPolygons, clipLines, clipPoints, clipPolygons, classifyRings } from './tesselate';

import { getLineSegments, getArcSegments, getFaceSegmentsConcave, POINT_CLOUD_SCHEMA, LINE_SCHEMA, FACE_SCHEMA, LABEL_SCHEMA, ARC_GEOMETRY_SCHEMA, ARC_LABEL_SCHEMA } from '@use-gpu/workbench';

const DEBUG_LAYERS = false;
const DEBUG_UNSTYLED = true;

const POS = {positions: 'vec2<f32>'};
export const SCHEMAS = {
  point: adjustSchema(POINT_CLOUD_SCHEMA, POS),
  line:  adjustSchema(LINE_SCHEMA, POS),
  face:  adjustSchema(FACE_SCHEMA, POS),
  label: adjustSchema(LABEL_SCHEMA, POS),
  arcGeometry: adjustSchema(ARC_GEOMETRY_SCHEMA, POS),
  arcLabel: ARC_LABEL_SCHEMA,
};

type Vec2 = {x: number, y: number};

export type MVTShapes = {
  point?: MVTPoint,
  line?: MVTLine,
  ring?: MVTLine,
  face?: MVTFace,
  label?: MVTLabel,
  arcLabel?: MVTArcLabel,
};

export type MVTAggregates = {
  point?: MVTAggregate,
  line?: MVTAggregate,
  ring?: MVTAggregate,
  face?: MVTAggregate,
  label?: MVTAggregate,
  arcLabel?: MVTAggregate,
  arcGeometry?: MVTAggregate,
};

export type MVTAggregate = AggregateItem & {
  sparse?: number,
};

export type MVTShape = {
  positions: any,
};

export type MVTShapeSingle = {
  color: ColorLike[],
  depth: number[],
  zBias: number[],
};

export type MVTPoint = MVTShapeSingle & {
  positions: XY[][],
  size: number[],
};

export type MVTLine = MVTShapeSingle & {
  positions: XY[][],
  width: number[],
};

export type MVTFace = MVTShapeSingle & {
  positions: XY[][][],
};

export type MVTLabel = MVTShapeSingle & {
  positions: XY[],
  labels: string[],
  expand: number[],
  size: number[],
};

export type MVTArcLabel = {
  positions: XY[][],
  labels: string[],
  expands: number[],
  sizes: number[],
  colors: ColorLike[],
  depths: number[],
  zBiases: number[],
};

export const getMVTShapes = (
  x: number, y: number, zoom: number,
  mvt: VectorTile,
  styles: MVTStyleSheet,
  locale: string | null | undefined = null,
  tesselate: number = 0,
  flipY: boolean = false,
): MVTShapes => {
  const z = Math.pow(2, zoom);
  const iz = 1 / z

  const ox = x * iz;
  const oy = y * iz;

  const {layers} = mvt;
  
  const nameProp = locale ? `name_${locale}` : 'name';

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
    label: {
      positions: [],
      color: [],
      size: [],
      depth: [],
      zBias: [],
      expand: [],
      labels: [],
    },
    arcLabel: {
      positions: [],
      colors: [],
      sizes: [],
      depths: [],
      zBiases: [],
      expands: [],
      labels: [],
    },
  };

  const addPoint = (
    geometry: XY[],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    transform: (x: number, y: number) => XY,
  ) => {
    const positions = geometry.map(([x, y]: XY) => transform(x, y));

    if (properties[nameProp]) {
      addPointLabel(positions, style, properties[nameProp]);
    }

    if (style.point) {
      shapes.point.positions.push(positions);
      shapes.point.color.push(style.point.color);
      shapes.point.size.push(style.point.size);
      shapes.point.depth.push(style.point.depth);
      shapes.point.zBias.push(style.point.zBias);
    }
  }

  const addLine = (
    geometry: XY[][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    transform: (x: number, y: number) => XY,
  ) => {
    const positions = geometry.map((path) => path.map(([x, y]: XY) => transform(x, y)));

    if (properties[nameProp]) {
      addArcLabel(positions, style, properties[nameProp]);
    }

    if (style.line) {
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

  const addPointLabel = (
    positions: XY[],
    style: MVTStyleProperties,
    text: string,
  ) => {
    if (style.font) {
      if (style.font.outline) {
        shapes.label.positions.push(...positions);
        shapes.label.color.push(style.font.stroke);
        shapes.label.size.push(style.font.size);
        shapes.label.expand.push(style.font.outline);
        shapes.label.depth.push(style.font.depth);
        shapes.label.zBias.push(style.font.zBias - 1);

        shapes.label.labels.push(text);
      }

      shapes.label.positions.push(...positions);
      shapes.label.color.push(style.font.fill);
      shapes.label.size.push(style.font.size);
      shapes.label.expand.push(0);
      shapes.label.depth.push(style.font.depth);
      shapes.label.zBias.push(style.font.zBias);

      shapes.label.labels.push(text);
    }    
  };

  const addArcLabel = (
    positions: XY[][],
    style: MVTStyleProperties,
    text: string,
  ) => {
    if (style.font) {
      if (style.font.outline) {
        shapes.arcLabel.positions.push(...positions);

        shapes.arcLabel.labels.push(text);
        shapes.arcLabel.colors.push(style.font.stroke);
        shapes.arcLabel.sizes.push(style.font.size);
        shapes.arcLabel.expands.push(style.font.outline);
        shapes.arcLabel.depths.push(style.font.depth);
        shapes.arcLabel.zBiases.push(style.font.zBias - 1);
      }

      shapes.arcLabel.positions.push(...positions);

      shapes.arcLabel.labels.push(text);
      shapes.arcLabel.colors.push(style.font.fill);
      shapes.arcLabel.sizes.push(style.font.size);
      shapes.arcLabel.expands.push(0);
      shapes.arcLabel.depths.push(style.font.depth);
      shapes.arcLabel.zBiases.push(style.font.zBias);
    }    
  };

  const addPolygon = (
    geometry: XY[][][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    extent: number,
    transform: (x: number, y: number) => XY,
  ) => {
    const originalGeometry = geometry;

    if (properties[nameProp]) {
      /*
      shapes.label.positions.push(...geometry);
      shapes.label.color.push(style.font.fill);
      shapes.label.size.push(style.font.size);
      shapes.label.depth.push(style.font.depth);
      shapes.label.zBias.push(style.font.zBias);
      shapes.label.labels.push(properties.name);
      */
    }

    if (style.face) {
      if (tesselate > 0) geometry = tesselatePolygons(geometry, 0, 0, extent, extent, tesselate);
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
        const {rings, lines} = clipPolygons(originalGeometry, 0, 0, extent, extent);

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

  const unstyled: string[] = [];

  for (const k in layers) {
    const layer = layers[k];
    const {length, name} = layer;

    DEBUG_LAYERS && console.log("layer", name, layer, length)

    for (let i = 0; i < length; ++i) {
      const feature = layer.feature(i);
      const {type: t, properties, extent} = feature;

      const klass = properties['class'] as any as string;

      const ownStyles = styles[name + '/'+ klass] ?? styles[name] ?? styles[klass];
      const style = ownStyles ?? styles.default;

      if (DEBUG_UNSTYLED && !ownStyles) unstyled.push(`${klass}/${name} ${t}`);
      
      //if (klass === 'country') debugger;

      const transformTile = (x: number, y: number): XY => [
        (( ox + iz * (x / extent)) * 2 - 1),
        (((oy + iz * (y / extent)) * 2 - 1) * (flipY ? -1 : 1)),
      ];

      if (t === 1) {
        const loaded = feature.loadGeometry().map(([{x, y}]: Vec2[]): XY => [x, y]);
        if (!loaded) continue;
        
        const geometry = clipPoints(loaded, 0, 0, extent, extent);
        if (geometry.length) addPoint(geometry, properties, style, transformTile);
      }
      else if (t === 2) {
        const loaded = feature.loadGeometry().map((path: Vec2[]) => path.map(({x, y}): XY => [x, y]));
        if (!loaded) continue;

        const geometry = clipLines(loaded, 0, 0, extent, extent);
        if (geometry.length) addLine(geometry, properties, style, transformTile);
      }
      else if (t === 3) {
        const loaded = feature.loadGeometry();
        if (!loaded) continue;
        
        const rings = loaded.map((ring: Vec2[]) => {
          const r = ring.map((({x, y}): XY => [x, y]));
          r.pop();
          return r;
        });

        let geometry = classifyRings(rings);

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
  if (!shapes.label.positions.length) delete s.label;
  if (!shapes.arcLabel.positions.length) delete s.arcLabel;

  DEBUG_UNSTYLED && unstyled.length && console.warn('Unstyled', unstyled);

  return s;
};

export const aggregateMVTShapes = (shapes: MVTShapes): MVTAggregates => {
  const out: MVTAggregates = {};

  if (shapes.point) out.point = aggregateMVTShape(shapes.point, SCHEMAS.point);
  if (shapes.line) out.line = aggregateMVTShape(shapes.line, SCHEMAS.line, getLineSegments);
  if (shapes.ring) out.ring = aggregateMVTShape(shapes.ring, SCHEMAS.line, getLineSegments, true);
  if (shapes.face) out.face = aggregateMVTShape(shapes.face, SCHEMAS.face, getFaceSegmentsConcave);
  if (shapes.label) out.label = aggregateMVTShape(shapes.label, SCHEMAS.label);
  
  if (shapes.arcLabel) {
    out.arcLabel = aggregateMVTShape(shapes.arcLabel, SCHEMAS.arcLabel, undefined, false, false, false, 'labels', 1);
    out.arcGeometry = aggregateMVTShape(shapes.arcLabel, SCHEMAS.arcGeometry, getArcSegments);
  
    out.arcLabel.attributes.anchors = out.arcGeometry.attributes.anchors;
    delete out.arcGeometry.attributes.anchors;
  }

  return out;
};

const aggregateMVTShape = (
  shape: MVTShape,
  schema: ArchetypeSchema,
  segments?: SegmentDecorator,
  loop?: boolean,
  start?: boolean,
  end?: boolean,
  countKey: string = 'positions',
  countDims: number = 2,
) => {
  const countAttribute = (shape as Record<string, any[]>)[countKey];
  const [chunks, groups] = toChunkCounts(countAttribute, countDims);

  const itemCount = countAttribute.length;
  const dataCount = (chunks as number[]).reduce((a, b) => a + b, 0);

  // Make arrays for merged attributes
  const {fields, attributes, archetype} = allocateSchema(
    schema,
    itemCount,
    dataCount,
    0,
    undefined,
    (key: string) => !!(shape as any)[key],
  );

  const slices = [];

  // Blit all data into merged arrays
  for (const k in fields) {
    const {js} = schema[k];
    const {array, dims, depth = 0, prop = k} = fields[k];
    const slice = k === countKey;

    if (js) {
      (array as any).length = 0;
      (array as any).push(...(shape as any)[prop]);
      
      if (slice) slices.push(...seq(array.length).map(() => 1));
      continue;
    }

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
      copyRecursiveNumberArray((shape as any)[prop], array, dimsIn, dimsIn, depth || 1, 0, 1);
    }
  }

  // Get emitters for data + segment data
  const [, emitted, count, indexed, sparse] = decorateMVTSegments(
    fields[countKey],
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
    sparse,
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

  //if (segments === getFaceSegmentsConcave) debugger;

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
  const emitted = emitAttributes(mergedSchema, emitters, 1, total, indexed);
  
  return [mergedSchema, emitted, total, indexed, sparse];
};

const tesselatePolygons = (polygons: XY[][][], l: number, t: number, r: number, b: number, limit: number = 1, depth: number = 0): XY[][][] => {
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
      ...tesselatePolygons(tl, l, t, x, y, limit, depth),
      ...tesselatePolygons(tr, x, t, r, y, limit, depth),
      ...tesselatePolygons(bl, l, y, x, b, limit, depth),
      ...tesselatePolygons(br, x, y, r, b, limit, depth),
    ];
  }

  return [...tl, ...tr, ...bl, ...br];
};
