import type { LiveComponent, LiveNode } from '@use-gpu/live';
import { memo, morph, use, provide, makeContext, useContext, useMemo } from '@use-gpu/live';
import { RouterContext } from './router';
import { Route } from './types';

export type RouteState = {
  base: string,
  params: Record<string, string>,
  routes?: Record<string, Route>,
};

export const RouteContext = makeContext<RouteState>({
  base: '/',
  params: {},
}, 'RouteContext');

type Matcher = {
  regexp: RegExp,
  element: LiveNode<any>,
  base: string,
  routes?: Record<string, Route>,
};

export type RoutesProps = {
  base?: string,
  routes?: Record<string, Route> | null,
  morph?: boolean,
};

const NO_PATH = '';

const joinPath = (a: string, b: string) => {
  if (b[0] === '/') return b;
  if (a[a.length - 1] === '/') return a + b;
  return a + '/' + b;
}

const escapeName = (s: string) => s.replace(/[^A-Za-z0-9_-]*/g, '');
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const Outlet = () => {
  const context = useContext(RouteContext);
  return context.routes ? use(Routes, context) : null;
}

export const Routes: LiveComponent<RoutesProps> = memo((props: RoutesProps) => {
  const {
    routes,
    base = NO_PATH,
    morph: shouldMorph = false
  } = props;

  const {route: routeState} = useContext(RouterContext);
  const {path: currentPath} = routeState;

  const matchers = useMemo(() => {
    const matchers = [] as Matcher[];

    for (const path in routes) {
      const {element, routes: rs, exact} = routes[path];

      const fullPath = joinPath(base, path);
      const regexp = pathSpecToRegexp(fullPath, exact);

      matchers.push({
        regexp,
        element: element ?? null,
        base: fullPath,
        routes: rs,
      });
    }

    return matchers;
  }, [base, routes]);

  const b = base;
  const [context, element] = useMemo(() => {
    let base = b;

    let params = {} as Record<string, string>;
    let routes = null as Record<string, Route> | null;
    let element = null as LiveNode<any>;

    for (const matcher of matchers) {
      const match = currentPath.match(matcher.regexp);
      if (match) {
        if (match.groups) params = match.groups;
        if (matcher.routes) routes = matcher.routes;
        if (matcher.element) element = matcher.element;
        if (matcher.base) base = matcher.base;

        break;
      }
    }

    return [{routes, base, params}, element];
  }, [base, matchers, currentPath]);

  if (element) return provide(RouteContext, context, shouldMorph ? morph(element) : element);
  if (context.routes) return use(Routes, context);
  return null;
}, 'Routes');

export const pathSpecToRegexp = (s: string, exact: boolean = false) => {
  const segments = s.split('/').filter(s => s.length);
  let regexp = '^';

  for (const segment of segments) {
    regexp += '/';
    if (segment[0] === ':') {
      const name = escapeName(segment.slice(1));
      regexp += `(?<${name}>[^/]*)`;
    }
    else if (segment === '*') {
      regexp += '[^/]*';
    }
    else {
      regexp += escapeRegExp(segment);
    }
  }

  if (exact) {
    if (segments.length === 0) regexp += '/';
    return new RegExp(regexp + '$');
  }

  const isFolder = s[s.length - 1] === '/';
  if (!isFolder) regexp += '(/|$)';

  return new RegExp(regexp);
}
