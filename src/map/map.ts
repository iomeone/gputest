import type { LiveComponent, PropsWithChildren } from '../live';

export type MapProps = PropsWithChildren<object>;

export const Map: LiveComponent<MapProps> = (props) => {
  return props.children ?? null;
};


