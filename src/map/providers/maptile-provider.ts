import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { FetchAPIOptions } from '@use-gpu/workbench';
import { provide, useMemo } from '@use-gpu/live';
import { TileContext } from './tile-provider';

export type MapTileProviderProps = PropsWithChildren<{
  url?: string,
  options?: FetchAPIOptions,
}>;

const makeGetMVT = (template: string, options?: FetchAPIOptions) => {
  const chunks = template.split(/{(x|y|zoom)}/g);
  return (x: number, y: number, zoom: number) => {
    const ts = {x, y, zoom} as Record<string, number>;
    const url = chunks.map((chunk, i) => i % 2 ? ts[chunk] : chunk).join('');
    return {url, options};
  };
};

export const MapTileProvider: LC<MapTileProviderProps> = (props: MapTileProviderProps) => {
  const {
    url = `/tiles/{zoom}-{x}-{y}.mvt`,
    options,
    children,
  } = props;

  const context = useMemo(() => ({
    getMVT: makeGetMVT(url, options),
  }), [url, options]);

  return provide(TileContext, context, children);
};
