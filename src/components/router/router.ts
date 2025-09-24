import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { makeContext, memo, provide, use, useMemo, useResource, useState } from '@use-gpu/live';
import { Routes } from './routes';

export type Route = {
  element?: LiveElement<any>,
  routes?: Record<string, Route>,
};

export type RouterState = {
  path: string,
};

export type RouterAPI = {
  route: RouterState,
  back: () => void,
  forward: () => void,
  go: (n: number) => void,
  push: (path: string) => void,
  replace: (path: string) => void,
};

export const RouterContext = makeContext<RouterState>(null, 'RouterContext');

export type RouterProps = {
  source?: any,
  children?: LiveElement<any>,
  routes?: Record<string, Route>,
};

export const Router: LiveComponent<RouterProps> = memo(({source, routes, children}: RouterProps) => {
  source = source ?? makeBrowserHistory();

  const [state, setState] = useState<RouterState>({
    path: source.path(),
  });

  useResource(() => source.resource(() =>
    setState((s) => ({
      ...s,
      path: source.path(),
    }))
  ), []);

  const api = useMemo(() => ({
    route: state,
    back: source.back,
    forward: source.forward,
    go: source.go,
    push: source.push,
    replace: source.replace,
  }), [state, source]);

  if (routes) children = use(Routes)({ routes });

  return provide(RouterContext, api, children);
}, 'Router');

export const makeBrowserHistory = () => {
  const {history, location} = window;

  return {
    resource: (callback: any) => {
      const handlePopState = (e: PopStateEvent) => callback(e);

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    },

    path: () => {
      if (location.hash.match(/^#\//)) return '/' + location.hash.slice(2);
      return location.pathname;
    },

    back: () => history.back(),
    forward: () => history.forward(),
    go: (n: number) => history.go(n),
    push: (path: string) => history.pushState({path}, document.title, path),
    replace: (path: string) => history.replaceState({path}, document.title, path),
  };
};
