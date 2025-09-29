import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';

export type MapProps = PropsWithChildren<object>;

export const Map: LiveComponent<MapProps> = (props) => {
  return props.children ?? null;
};


