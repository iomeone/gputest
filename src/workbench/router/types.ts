import type { LiveNode } from '@use-gpu/live';

export type Route = {
  element?: LiveNode<any>,
  routes?: Record<string, Route>,
  exact?: boolean,
};

export type RouterState = {
  path: string,
  query: Record<string, string>,
};

export type RouterLink = {
  href: string,
};

export type QueryParams = Record<string, string>;

export type RouterAPI = {
  route: RouterState,

  back: () => void,
  forward: () => void,
  go: (n: number) => void,
  push: (path: string, query?: QueryParams | string) => void,
  replace: (path: string, query?: QueryParams | string) => void,

  linkTo: (path: string, query?: QueryParams | string) => RouterLink,
};
