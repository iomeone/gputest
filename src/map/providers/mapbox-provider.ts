import type { LC, PropsWithChildren } from '@use-gpu/live';
import { provide, useOne, useMemo } from '@use-gpu/live';
import { TileContext } from './tile-provider';

export type MapboxProviderProps = PropsWithChildren<{
  accessToken?: string,
  username?: string,
  style?: string,
}>;

const makeMVTSource = (
  username: string,
  style: string,
  accessToken: string,
) => (
  x: number,
  y: number,
  zoom: number,
) => `https://api.mapbox.com/v4/${username}.${style}/${zoom}/${x}/${y}.mvt?access_token=${accessToken}`;

export const MapboxProvider: LC<MapboxProviderProps> = (props: MapboxProviderProps) => {
  const {
    username = 'mapbox',
    style = 'mapbox-streets-v8',
    accessToken = '',
    children,
  } = props;

  useOne(() => accessToken || console.warn('<MapboxProvider> accessToken was not set.'), accessToken);

  const context = useMemo(() => ({
    getMVT: makeMVTSource(username, style, accessToken),
  }), [username, style, accessToken]);

  return provide(TileContext, context, children);
};
