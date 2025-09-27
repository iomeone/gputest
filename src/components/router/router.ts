import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { makeContext, memo, provide, use, useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { Routes } from './routes';

export type Route = {
  element?: LiveElement<any>,
  routes?: Record<string, Route>,
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
  push: (path: string, query: QueryParams | string) => void,
  replace: (path: string, query: QueryParams | string) => void,

  linkTo: (path: string, query: QueryParams | string) => RouterLink,
};

export const RouterContext = makeContext<RouterAPI>(null, 'RouterContext');

export type RouterProps = {
  source?: any,
  children?: LiveElement<any>,
  routes?: Record<string, Route>,
};

export const Router: LiveComponent<RouterProps> = memo(({source, routes, children}: RouterProps) => {

  const src = useOne(() => source ?? makeBrowserHistory(), source);

  const [state, setState] = useState<RouterState>({
    path: src.path(),
    query: src.query(),
  });

  useResource((dispose) => {
    src.resource(() =>
      setState((s) => ({
        ...s,
        path: src.path(),
        query: src.query(),
      }))
    );
    dispose(() => src.resource(() => {}));
  }, [src]);

  const api = useMemo(() => ({
    route: state,
    back: src.back,
    forward: src.forward,
    go: src.go,
    push: src.push,
    replace: src.replace,
    linkTo: src.linkTo,
  }), [state, src]);

  if (routes) children = use(Routes, { routes });

  return provide(RouterContext, api, children);
}, 'Router');

export const useRouterContext = () => useContext(RouterContext);

export const makeRelativeURL = (path: string, query?: QueryParams | string) => {
  if (typeof query === 'string') if (query.length) return path + '?' + query.replace(/^\?/, '');
  if (query) {
    let i = 0;
    for (let k in query) {
      const vs = query[k];
      path = path + (i++ ? '?' : '&') + encodeURIComponent(k) + '=' + encodeURIComponent(vs);
    }
  }
  return path;
};

export const makeBrowserHistory = () => {
  const {history, location} = window;

  let popState: (e: PopStateEvent) => void;

  let self = {
    resource: (callback: any) => {
      const handlePopState = popState = (e: PopStateEvent) => callback(e);

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    },

    path: () => {
      return location.pathname;
    },
    
    query: () => {
      const out = {} as Record<string, string>;
      const {search} = location;
      if (search.length) {
        const params = URLSearchParams(search);
        for (const k of params.keys()) out[k] = params.get(k);
      }
      return out;
    },

    back: () => history.back(),
    forward: () => history.forward(),
    go: (n: number) => history.go(n),
    push: (path: string, query?: QueryParams | string) => {
      history.pushState({path, query}, document.title, makeRelativeURL(path, query));
      popState();
    },
    replace: (path: string, query?: QueryParams | string) => {
      history.replaceState({path, query}, document.title, makeRelativeURL(path, query));
      popState();
    },

    linkTo: (path: string, query?: QueryParams | string) => {
      const href = makeRelativeURL(path, query);
      const onClick = (e: any) => {
        if (e?.ctrlKey || e?.button !== 0) return;

        e?.preventDefault();
        self.push(path, query);
        popState();
      }
      return {href, onClick};
    },
  };
  
  return self;
};
