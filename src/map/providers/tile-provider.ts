import { makeContext, useContext, useNoContext } from '@use-gpu/live';
import type { FetchAPIOptions } from '@use-gpu/workbench';

type TileSource = (x: number, y: number, zoom: number) => {
  url: string,
  options?: FetchAPIOptions,
};

type TileContextProps = Record<string, TileSource>;

export const TileContext = makeContext<TileContextProps>(undefined, 'TileContext');

export const useTileContext = () => useContext(TileContext);
export const useNoTileContext = () => useNoContext(TileContext);
