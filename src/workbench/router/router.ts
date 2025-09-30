import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import { makeContext, memo, provide, use, useContext, useMemo, useResource, useState } from '@use-gpu/live';
import { Routes } from './routes';
import { QueryParams, Route, RouterState, RouterAPI } from './types';

export const RouterContext = makeContext<RouterAPI>(undefined, 'RouterContext');

export type RouterProps = PropsWithChildren<{
  source?: any,
  routes?: Record<string, Route>,
  base?: string,
  hash?: boolean,
}>;

export const Router: LiveComponent<RouterProps> = memo(({
  source,
  routes,
  base,
  hash,
  children,
}: RouterProps) => {

  const src = useMemo(() => source ?? makeBrowserHistory(base, hash), [source ?? base, hash]);

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

export const makeBasedURL = (base: string, suffix: string, hash?: boolean) => {
  suffix = suffix.replace(/^\//, '');
  if (hash) return base + '#!/' + suffix;
  return base + suffix;
};

export const makeRelativeURL = (base: string, path: string, query?: QueryParams | string, hash?: boolean) => {
  if (typeof query === 'string') {
    if (query.length) return makeBasedURL(base, path + '?' + query.replace(/^\?/, ''), hash);
    return makeBasedURL(base, path, hash);
  }
  if (query) {
    let i = 0;
    for (const k in query) {
      const vs = query[k];
      path = path + (i++ ? '?' : '&') + encodeURIComponent(k) + '=' + encodeURIComponent(vs);
    }
  }
  return makeBasedURL(base, path, hash);
};

export const makeBrowserHistory = (base: string = '', hash?: boolean) => {
  const {history, location} = window;

  // Normalize to `/foo/bar/`
  base = base.replace(/^\/|\/$/g, '');
  base = '/' + base + (base.length ? '/' : '');

  // Initialize from #!/ in URL for static SPA.
  const hasHash = location.hash.match(/^#!\//);
  if (hasHash || hash) {
    const [path, query] = (hasHash && location.hash.slice(2).split('?')) || ['/', ''];
    history.replaceState({path, query}, document.title, makeRelativeURL(base, path, query, hash));
  }

  const notifyPopState = () => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const self = {
    resource: (callback: any) => {
      const handlePopState = (e?: PopStateEvent) => callback(e);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    },

    path: () => {
      if (hash) return location.hash.slice(2).split('?')[0];
      if (location.pathname.indexOf(base) === 0) return '/' + location.pathname.slice(base.length);
      return location.pathname;
    },

    query: () => {
      const out = {} as Record<string, string>;

      let {search} = location;
      if (hash) search = location.hash.slice(2).split('?')[1] ?? '';

      if (search.length) {
        const params = new URLSearchParams(search);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const k of (params as any).keys()) out[k] = params.get(k)!;
      }
      return out;
    },

    back: () => history.back(),
    forward: () => history.forward(),
    go: (n: number) => history.go(n),
    push: (path: string, query?: QueryParams | string) => {
      history.pushState({path, query}, document.title, makeRelativeURL(base, path, query, hash));
      notifyPopState();
    },
    replace: (path: string, query?: QueryParams | string) => {
      history.replaceState({path, query}, document.title, makeRelativeURL(base, path, query, hash));
      notifyPopState();
    },

    linkTo: (path: string, query?: QueryParams | string) => {
      const href = makeRelativeURL(base, path, query, hash);
      const onClick = (e: any) => {
        if (e?.ctrlKey || e?.button !== 0) return;

        e?.preventDefault();
        self.push(path, query);
      }
      return {href, onClick};
    },
  };

  return self;
};
