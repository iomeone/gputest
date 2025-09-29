import { makeContext, useContext, useNoContext } from '@use-gpu/live';

type TileSource = (x: number, y: number, zoom: number) => string;

type TileContextProps = Record<string, TileSource>;

export const TileContext = makeContext<TileContextProps>(undefined, 'TileContext');

export const useTileContext = () => useContext(TileContext);
export const useNoTileContext = () => useNoContext(TileContext);
