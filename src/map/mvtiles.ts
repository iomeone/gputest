import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';

import { gather, use, keyed, yeet, memo, useAwait, useCallback, useOne, useMemo } from '@use-gpu/live';
import { VirtualLayers, useLayoutContext, useForceUpdate } from '@use-gpu/workbench';
import { useRangeContext } from '@use-gpu/plot';

import { useTileContext } from './providers/tile-provider';
import { MVTStyleContextProps, useMVTStyleContext } from './providers/mvt-style-provider';

import { getMVTShapes } from './util/mvtile';
import LRU from 'lru-cache';

import { VectorTile } from 'mapbox-vector-tile';

const getKey = (x: number, y: number, zoom: number) => (zoom << 20) + (y << 10) + (x << 0);
const parseKey = (v: number) => [v & 0x3FF, (v >> 10) & 0x3FF, (v >> 20) & 0x3FF];

const getUpKey = (x: number, y: number, zoom: number) => getKey(x >> 1, y >> 1, zoom - 1);
const getDownKey = (x: number, y: number, zoom: number, dx: number, dy: number) => getKey((x << 1) + dx, (y << 1) + dy, zoom - 1);

//const URLS = new Set();

export type MVTilesProps = {
  minLevel?: number,
  detail?: number,
};

export type MVTileProps = {
  tiles: {
    cache: LRU<any, any>,
    loaded: Map<number, number>,
    flipY: boolean,
    styles: MVTStyleContextProps,
    forceUpdate: () => void,
  },
  key: number,
  hide?: boolean,
  tesselate?: number,
};

export const MVTiles: LiveComponent<MVTilesProps> = (props: PropsWithChildren<MVTilesProps>) => {
  const {
    minLevel = 0,
    detail = 1,
    children,
  } = props;

  const [version, forceUpdate] = useForceUpdate();

  const layout = useLayoutContext();
  const styles = useMVTStyleContext();
  let [[minX, maxX], [minY, maxY]] = useRangeContext();

  const flipY = layout[1] > layout[3];
  if (flipY) [minY, maxY] = [-maxY, -minY];

  const cache = useOne(() => new LRU({ max: 200 }), styles);
  const loaded = useOne(() => new Map<number, number>(), styles);
  const tiles = useMemo(() => ({cache, loaded, flipY, styles, forceUpdate}), [flipY, styles]);
  const seen = useOne(() => new Set<number>());

  const dx = Math.abs(maxX - minX) / 2;
  const dy = Math.abs(maxY - minY) / 2;
  
  const zoom = Math.max(minLevel, Math.ceil(-Math.log2(Math.min(dx, dy) / detail)));
  const tile = Math.pow(2, zoom);

  const minIX = Math.floor((minX * .5 + .5) * tile);
  const minIY = Math.floor((minY * .5 + .5) * tile);

  const maxIX = Math.ceil((maxX * .5 + .5) * tile);
  const maxIY = Math.ceil((maxY * .5 + .5) * tile);
  
  const out: LiveElement[] = [];
  
  const w = maxIX - minIX;
  const h = maxIY - minIY;

  seen.clear();
  
  const tesselate = 5 - zoom;
  const gz = 1 << (zoom);

  for (let x = minIX; x < maxIX; x++) {
    const edgeX = x === minIX;
    const upX = (x === minIX || x === maxIX - 1) ? 1 : 2;

    for (let y = minIY; y < maxIY; y++) {
      const edgeY = y === minIY;
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
            out.push(keyed(MVTile, upKey, {tiles, key: upKey, tesselate: tesselate + 1}));
            seen.add(upKey);
          }
          out.push(keyed(MVTile, key, {tiles, key, tesselate, hide: true}));
          seen.add(key);
          continue;
        }
      }
      out.push(keyed(MVTile, key, {tiles, key, tesselate}));
      seen.add(key);
    }
  }

  return useOne(() => use(VirtualLayers, { children: out }));
};

const MVTile: LiveComponent<MVTileProps> = memo((props: MVTileProps) => {
  const {tiles: {cache, loaded, flipY, styles, forceUpdate}, key, hide, tesselate} = props;
  const {getMVT} = useTileContext();

  const [x, y, zoom] = parseKey(key);
  const upKey = getUpKey(x, y, zoom);

  const run = useCallback(async () => (
    cache.get(key) ?? fetch(getMVT(x, y, zoom))
      .then(res => res.arrayBuffer())
      .then(ab => {
        //URLS.add(getMVT(x, y, zoom).split('?')[0]);
        const mvt = new VectorTile(new Uint8Array(ab));
        const shapes = getMVTShapes(x, y, zoom, mvt, styles, flipY, tesselate);

        cache.set(key, shapes);
        loaded.set(upKey, (loaded.get(upKey) || 0) + 1);
        forceUpdate();
        //console.log({URLS: JSON.stringify(Array.from(URLS))})

        return shapes;
      })
      .catch(e => console.error(e))
  ), [key, styles, flipY]);

  let s: any;
  let [shapes] = useAwait(run);
  if (!shapes && (s = cache.get(key))) shapes = s;

  return !hide ? yeet(shapes) : null;
}, 'MVTile');
