import type { LC } from '../live';
import type { CPUGeometry, StorageSource, LambdaSource } from '../core';
import type { FetchAPIOptions } from '../workbench';
import type { DistanceLODNode, MVTStyleSheet, QuadTreeKey, QuadTreeNode, QuadTreeLODStrategy } from './types';

import { toDataBounds } from '../core';
import { use, fragment, useResource } from '../live';
import { AABBHelper, Data, PointLayer, LineLayer, FaceLayer, LabelLayer, ArcLabelLayer, SDFFontProvider } from '../workbench';

import { useTileContext } from './providers/tile-provider';
import { useMVTStyleContext } from './providers/mvt-style-provider';

import { QuadTree } from './quadtree';
import { SCHEMAS, MVTAggregates } from './util/mvtile';

import { makeDispatch } from './worker/dispatch';

//const URLS = new Set();

export type MVTilesProps = {
  locale?: string | null,
  strategy?: QuadTreeLODStrategy<MVTileData>,
  minTesselate?: number,
  maxFetches?: number,
  maxCached?: number,
  flipY?: boolean,
  debug?: boolean,
};

export type MVTileData = DistanceLODNode & {
  point?: CPUGeometry,
  line?: CPUGeometry,
  ring?: CPUGeometry,
  face?: CPUGeometry,
  label?: CPUGeometry,
  arcLabel?: CPUGeometry,
  arcGeometry?: CPUGeometry & { sparse: number },
};

type TileWorker = {
  loadMVT: (
    x: number,
    y: number,
    zoom: number,
    url: string,
    options: FetchAPIOptions,
    styles: MVTStyleSheet,
    locale?: string | null,
    tesselate?: number,
    flipY?: boolean,
  ) => Promise<MVTAggregates>,
};

export const MVTiles: LC<MVTilesProps> = (props: MVTilesProps) => {
  const {
    locale,
    strategy,
    minTesselate = 0,
    maxFetches = 16,
    maxCached = Infinity,
    flipY = false,
    debug = false,
  } = props;

  const styles = useMVTStyleContext();
  const {getMVT} = useTileContext();

  const worker = useResource((dispose) => {
    const worker = makeDispatch<TileWorker>(
      () => new Worker(new URL('./worker/worker.js', import.meta.url)),
    );
    dispose(worker.terminate);
    return worker;
  });
  
  const fetchTile = async ({x, y, zoom}: QuadTreeKey) => {
    const {url, options} = getMVT(x, y, zoom);
    const tesselate = Math.max(1, minTesselate - zoom);

    //URLS.add(url);

    const s = Math.pow(2, 1 - zoom);
    const box = {
      min: [-1 + x * s, -1 + y * s, 0],
      max: [-1 + (x + 1) * s, -1 + (y + 1) * s, 0],
    };

    if (flipY) [box.min[1], box.max[1]] = [-box.max[1], -box.min[1]];

    const bounds = toDataBounds(box);

    const data = await worker.loadMVT(
      x, y, zoom, url, options, styles, locale, tesselate, flipY,
    );

    return {...data, bounds};
  };
  
  const renderTile = ({key, data}: QuadTreeNode<MVTileData>) => {
    const out = [];

    if (debug) {
      out.push(use(AABBHelper, {
        min: data.bounds.min,
        max: data.bounds.max,
        color: [0.5, 0.5, 0.8, 0.02],
        mode: 'transparent',
        width: 2,
      }));
    };

    if (data.point) {
      out.push(use(Data, {
        immutable: true,
        data: data.point.attributes,
        schema: SCHEMAS.point,
        render: (props: Record<string, StorageSource | LambdaSource>) => use(PointLayer, props),
      }));
    }
    if (data.line) {
      out.push(use(Data, {
        immutable: true,
        data: data.line.attributes,
        schema: SCHEMAS.line,
        render: (props: Record<string, StorageSource | LambdaSource>) => use(LineLayer, props),
      }));
    }
    if (data.ring) {
      out.push(use(Data, {
        immutable: true,
        data: data.ring.attributes,
        schema: SCHEMAS.line,
        render: (props: Record<string, StorageSource | LambdaSource>) => use(LineLayer, props),
      }));
    }
    if (data.face) {
      out.push(use(Data, {
        immutable: true,
        data: data.face.attributes,
        schema: SCHEMAS.face,
        render: (props: Record<string, StorageSource | LambdaSource>) => use(FaceLayer, props),
      }));
    }
    if (data.label) {
      out.push(use(Data, {
        immutable: true,
        data: data.label.attributes,
        schema: SCHEMAS.label,
        render: (props: Record<string, StorageSource | LambdaSource>) => use(LabelLayer, {
          ...props,
          detail: 32,
          labels: data.label?.attributes.labels,
        }),
      }));
    }
    if (data.arcLabel && data.arcGeometry) {
      out.push(use(Data, {
        immutable: true,
        data: data.arcLabel.attributes,
        schema: SCHEMAS.arcLabel,
        render: (labelProps: Record<string, StorageSource | LambdaSource>) => 
          use(Data, {
            immutable: true,
            data: data.arcGeometry?.attributes,
            schema: SCHEMAS.arcGeometry,
            render: (geometryProps: Record<string, StorageSource | LambdaSource>) =>
              use(ArcLabelLayer, {
                ...labelProps,
                ...geometryProps,
                detail: 32,
                maxArc: data.arcGeometry?.sparse,
                labels: data.arcLabel?.attributes.labels,
              }),
          }),
      }));
    }
    return fragment(out, key);
  };
  
  return (
    use(SDFFontProvider, {
      children: (
        use(QuadTree, {
          strategy,
          maxFetches,
          maxCached,
          fetch: fetchTile,
          render: renderTile,
        })
      ),
    })
  );
};

//setInterval(() => console.log(JSON.stringify([...URLS.values()])), 10000);
