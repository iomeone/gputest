import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { MVTStyleSheet, MVTStyleProperties } from '../types';

import { gather, use, yeet, useMemo, useOne } from '@use-gpu/live';
import { cutPolygon, cutPolygons, getRingArea } from './tess';
import earcut from 'earcut';
import { VectorTile } from 'mapbox-vector-tile';

type Vec2 = {x: number, y: number};

type XY = [number, number];
type XYZW = [number, number, number, number];

export const getMVTShapes = (
  x: number, y: number, zoom: number,
  mvt: VectorTile,
  styles: MVTStyleSheet,
  flipY: boolean,
  tesselate: number = 0,
) => {
  const z = Math.pow(2, zoom);
  const iz = 1 / z

  const ox = x * iz;
  const oy = y * iz;  

  const {layers} = mvt;

  const shapes = {
    point: [] as any[],
    line: [] as any[],
    face: [] as any[],
    label: [] as any[],
  };
  
  const addPoint = (
    geometry: Vec2[],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    toPoint4: (xy: XY) => XYZW,
  ) => {
    const positions = geometry.map(({x, y}: Vec2) => toPoint4([x, y]));
    const count = positions.length / 4;
    if (style.point) {
      if (properties.name) {
        shapes.label.push({
          position: positions,
          text: properties.name,
          color: style.point.color,
        });
      }
      else {
        shapes.point.push({
          count,
          positions,
          color: style.point.color,
          size: style.point.size,
        });
      }
    }
  }

  const addLine = (
    geometry: Vec2[][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    toPoint4: (xy: XY) => XYZW,
  ) => {
    const positions = geometry.flatMap((path) => path.flatMap(({x, y}: Vec2) => toPoint4([x, y])));
    const count = geometry.reduce((a, b) => a + b.length, 0);

    if (properties.name) {
      shapes.label.push({
        positions,
        text: properties.name,
        color: style.line.color,
      });
    }
    else {
      shapes.line.push({
        count,
        positions,
        segments: geometry.flatMap((path) => path.map((_, i) => i === 0 ? 1 : i === path.length - 1 ? 2 : 3)),
        color: style.line.color,
        width: style.line.width,
        depth: style.line.depth,
        zBias: style.line.zBias,
      });
    }
  }
  
  const addPolygon = (
    geometry: XY[][][],
    properties: Record<string, any>,
    style: MVTStyleProperties,
    extent: number,
    toPoint4: (xy: XY) => XYZW,
  ) => {
    const originalGeometry = geometry;
    if (tesselate > 0) geometry = tesselateGeometry(geometry, [0, 0, extent, extent], tesselate);

    if (style.face.fill) {
      for (const polygon of geometry) {
        const polygon4 = polygon.map((ring: XY[]) => ring.map((p: XY, i: number) => toPoint4(p)));

        const data = earcut.flatten(polygon4);
        if (!data.vertices.length) continue;

        const triangles = earcut(data.vertices, data.holes, data.dimensions);
        if (!triangles.length) continue;

        shapes.face.push({
          count: data.vertices.length / 4,
          positions: data.vertices,
          indices: triangles,
          color: style.face.fill,
          zBias: style.face.zBias,
          cullMode: 'back',
        });
      }
    }

    if (style.face.stroke) {
      originalGeometry.map((polygon: XY[][]) => polygon.map((ring: XY[]) => {
        ring.push(ring[0]);
      }));

      for (const polygon of originalGeometry) {
        const polygon4 = polygon.flatMap((ring: XY[]) => ring.flatMap((p: XY, i: number) => toPoint4(p)));
        shapes.line.push({
          count: polygon4.length / 4,
          positions: polygon4,
          segments: polygon.flatMap((path: XY[]) => path.map((p: XY, i: number) => {
            const next = path[i + 1] ?? path[i + 1 - path.length];
            return (
              (p[0] <= 0 && next[0] <= 0) || (p[0] >= extent && next[0] >= extent) ||
              (p[1] <= 0 && next[1] <= 0) || (p[1] >= extent && next[1] >= extent) ? 0 :
              i === 0 ? 1 :
              i === path.length - 1 ? 2 :
              3
            );
          })),
          color: style.face.stroke,
          width: style.face.width,
          depth: style.face.depth,
          zBias: style.face.zBias + style.face.width,
        });
      }
    }

  };

  const toPoint4 = ([x, y]: XY): XYZW => [
    (( ox + iz * x/256) * 2 - 1),
    (((oy + iz * y/256) * 2 - 1) * (flipY ? -1 : 1)),
    0,
    1,
  ];
  const style = styles['background'];
  if (style) {
    addPolygon([[[[0, 0], [256, 0], [256, 256], [0, 256]]]], {}, style, 256, toPoint4);
  }
  
  for (const k in layers) {
    const layer = layers[k];
    const {length, extent, name} = layer;
    
    //console.log("layer", name, layer, length)

    for (let i = 0; i < length; ++i) {
      const feature = layer.feature(i);
      const {type: t, properties, extent} = feature;
    
      const klass = properties['class'] as any as string;

      const style = styles[name + '/'+ klass] ?? styles[name] ?? styles[klass] ?? styles.default;

      const toPoint = ({x, y}: Vec2): XY => [x, y];
      const toPoint4 = ([x, y]: XY): XYZW => [
        (( ox + iz * (x / extent)) * 2 - 1),
        (((oy + iz * (y / extent)) * 2 - 1) * (flipY ? -1 : 1)),
        0,
        1,
      ];

      if (t === 1) {
        continue;
        const geometry = feature.asPoints();
        if (geometry) addPoint(geometry!, properties, style, toPoint4);
      }
      else if (t === 2) {
        const geometry = feature.asLines();
        if (geometry) addLine(geometry, properties, style, toPoint4);
      }
      else if (t === 3) {
        const poly = feature.asPolygons();
        if (!poly) continue;

        let geometry = poly.map((polygon: Vec2[][]) => polygon.map((ring: Vec2[]) => {
          const r = ring.map(toPoint); r.pop(); return r;
        }));

        geometry = cutPolygons(geometry, 1, 0, 0);
        geometry = cutPolygons(geometry, 0, 1, 0);
        geometry = cutPolygons(geometry, -1, 0, -extent);
        geometry = cutPolygons(geometry, 0, -1, -extent);

        addPolygon(geometry, properties, style, extent, toPoint4);
      }
    }
  }

  return shapes;    
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
