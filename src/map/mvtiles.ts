import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource, LambdaSource } from '@use-gpu/core';
import type { MVTStyleSheet } from './types';

import { clamp, adjustSchema } from '@use-gpu/core';
import { use, keyed, memo, useAwait, useCallback, useOne, useMemo, useResource } from '@use-gpu/live';
import { useLayoutContext, useForceUpdate, Data, PointLayer, LineLayer, FaceLayer, POINT_SCHEMA, LINE_SCHEMA, FACE_SCHEMA } from '@use-gpu/workbench';
import { useRangeContext } from '@use-gpu/plot';

import { useTileContext } from './providers/tile-provider';
import { MVTStyleContextProps, useMVTStyleContext } from './providers/mvt-style-provider';

import { MVTAggregates } from './util/mvtile';
import LRU from 'lru-cache';

import { makeDispatch, getConcurrency } from './worker/dispatch';

const POS = {positions: 'vec2<f32>'};
const SCHEMAS = {
  point: adjustSchema(POINT_SCHEMA, POS),
  line:  adjustSchema(LINE_SCHEMA, POS),
  face:  adjustSchema(FACE_SCHEMA, POS),
};

const getKey = (x: number, y: number, zoom: number) => (zoom << 20) + (y << 10) + (x << 0);
const parseKey = (v: number) => [v & 0x3FF, (v >> 10) & 0x3FF, (v >> 20) & 0x3FF];

const getUpKey = (x: number, y: number, zoom: number) => getKey(x >> 1, y >> 1, zoom - 1);

//const URLS = new Set();

type TileWorker = {
  loadMVT: (
    x: number,
    y: number,
    zoom: number,
    url: string,
    styles: MVTStyleSheet,
    flipY: boolean,
    tesselate?: number,
  ) => Promise<MVTAggregates>,
};

export type MVTilesProps = {
  minLevel?: number,
  maxLevel?: number,
  detail?: number,
};

export type MVTileProps = PropsWithChildren<{
  tiles: {
    cache: LRU<number, LiveElement[]>,
    loaded: Map<number, number>,
    flipY: boolean,
    styles: MVTStyleContextProps,
    forceUpdate: () => void,
  },
  key: number,
  hide?: boolean,
  tesselate?: number,
  worker: TileWorker,
}>;

export const MVTiles: LiveComponent<MVTilesProps> = (props: MVTilesProps) => {
  const {
    minLevel = 1,
    maxLevel = Infinity,
    detail = 1,
  } = props;

  const [, forceUpdate] = useForceUpdate();

  const layout = useLayoutContext();
  const styles = useMVTStyleContext();
  // eslint-disable-next-line prefer-const
  let [[minX, maxX], [minY, maxY]] = useRangeContext();
  
  const worker = useResource((dispose) => {
    const worker = makeDispatch<TileWorker>(
      () => new Worker(new URL('./worker/worker.js', import.meta.url)),
      getConcurrency(),
    );
    dispose(worker.terminate);
    return worker;
  });

  const flipY = layout[1] > layout[3];
  if (flipY) [minY, maxY] = [-maxY, -minY];

  const cache = useOne(() => new LRU<number, LiveElement[]>({ max: 200 }), styles);
  const loaded = useOne(() => new Map<number, number>(), styles);
  const tiles = useMemo(() => ({cache, loaded, flipY, styles, forceUpdate}), [flipY, styles]);
  const seen = useOne(() => new Set<number>());

  const dx = Math.abs(maxX - minX) / 2;
  const dy = Math.abs(maxY - minY) / 2;

  const zoom = clamp(Math.ceil(-Math.log2(Math.min(dx, dy) / detail)), minLevel, maxLevel);
  const tile = Math.pow(2, zoom);

  const minIX = Math.floor((minX * .5 + .5) * tile);
  const minIY = Math.floor((minY * .5 + .5) * tile);

  const maxIX = Math.ceil((maxX * .5 + .5) * tile);
  const maxIY = Math.ceil((maxY * .5 + .5) * tile);

  const out: LiveElement[] = [];

  seen.clear();
  
  if (1/minIX === 0 || 1/maxIX === 0) throw new Error("Map tile range is zero");

  const tesselate = 5 - zoom;
  const gz = 1 << (zoom);

  for (let x = minIX; x < maxIX; x++) {
    const upX = (x === minIX || x === maxIX - 1) ? 1 : 2;

    for (let y = minIY; y < maxIY; y++) {
      const upY = (y === minIY || y === maxIY - 1) ? 1 : 2;

      const xx = x < 0 ? x + gz : x >= gz ? x - gz : x;
      const yy = y < 0 ? y + gz : y >= gz ? y - gz : y;

      const key = getKey(xx, yy, zoom);
      if (seen.has(key)) continue;

      const upKey = getUpKey(xx, yy, zoom);
      const upLoaded = loaded.get(upKey) || 0;
      const upCount = upX * upY;

      if (zoom > minLevel && upLoaded < upCount) {
        if (cache.has(upKey)) {
          if (!seen.has(upKey)) {
            out.push(keyed(MVTile, upKey, {tiles, key: upKey, tesselate: tesselate + 1, worker}));
            seen.add(upKey);
          }
          out.push(keyed(MVTile, key, {tiles, key, tesselate, hide: true, worker}));
          seen.add(key);
          continue;
        }
      }
      out.push(keyed(MVTile, key, {tiles, key, tesselate, worker}));
      seen.add(key);
    }
  }

  return out;
};

const MVTile: LiveComponent<MVTileProps> = memo((props: MVTileProps) => {
  const {tiles: {cache, loaded, flipY, styles, forceUpdate}, key, hide, tesselate, worker} = props;
  const {getMVT} = useTileContext();

  const [x, y, zoom] = parseKey(key);
  const upKey = getUpKey(x, y, zoom);

  const run = useCallback(async () => {
    const cached = cache.get(key);
    if (cached) return cached;

    const url = getMVT(x, y, zoom);
    //URLS.add(url.split('?')[0]);

    try {
      /*
      const res = await fetch(url);
      let ab = await res.arrayBuffer();

      // MVT may be gzipped
      const bytes = new Uint8Array(ab);
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        const gunzip = new DecompressionStream('gzip');
        const stream = new Blob([ab]).stream().pipeThrough(gunzip);
        ab = await new Response(stream).arrayBuffer();
      }

      // Load raw MVT
      const mvt = new VectorTile(new Uint8Array(ab));
      const shapes = getMVTShapes(x, y, zoom, mvt, styles, flipY, tesselate);
      const aggregate = aggregateMVTShapes(shapes);
      console.log({shapes, aggregate})
      */
      const aggregate = await worker.loadMVT(
        x, y, zoom, url, styles, flipY, tesselate,
      );

      const out = [];
      if (aggregate.point) {
        out.push(use(Data, {
          immutable: true,
          data: aggregate.point.attributes,
          schema: SCHEMAS.point,
          render: (props: Record<string, StorageSource | LambdaSource>) => use(PointLayer, props),
        }));
      }
      if (aggregate.line) {
        out.push(use(Data, {
          immutable: true,
          data: aggregate.line.attributes,
          schema: SCHEMAS.line,
          render: (props: Record<string, StorageSource | LambdaSource>) => use(LineLayer, props),
        }));
      }
      if (aggregate.ring) {
        out.push(use(Data, {
          immutable: true,
          data: aggregate.ring.attributes,
          schema: SCHEMAS.line,
          render: (props: Record<string, StorageSource | LambdaSource>) => use(LineLayer, props),
        }));
      }
      if (aggregate.face) {
        out.push(use(Data, {
          immutable: true,
          data: aggregate.face.attributes,
          schema: SCHEMAS.face,
          render: (props: Record<string, StorageSource | LambdaSource>) => use(FaceLayer, props),
        }));
      }

      cache.set(key, out);
      loaded.set(upKey, (loaded.get(upKey) || 0) + 1);
      forceUpdate();
      //console.log({URLS: JSON.stringify(Array.from(URLS))})

      return out;
    }
    catch (e) {
      console.error('Tile', {zoom, x, y}, e);
    }
  }, [key, styles, flipY]);

  let e: LiveElement[] | undefined;
  let [elements] = useAwait(run, [key, worker]);
  if (!elements && (e = cache.get(key))) elements = e;

  return !hide ? elements : null;
}, 'MVTile');
