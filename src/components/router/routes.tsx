import { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
import { memo, morph, use, provide, makeContext, useContext, useOne, useMemo } from '@use-gpu/live';
import { RouterContext, Route } from './router';

export type RouteState = {
  base: string,
  params: Record<string, string>,
  routes?: Record<string, Route>,
};

export const RouteContext = makeContext<RouteState>(null, 'RouteContext');

type Matcher = {
  regexp: RegExp,
  element: LiveElement<any>,
  base: string,
  routes?: Record<string, Route>,
};

export type RoutesProps = {
  base?: string,
  routes?: Record<string, Route>,
};

const NO_PATH = '';

const joinPath = (a: string, b: string) => {
  if (b[0] === '/') return b;
  if (a[a.length - 1] === '/') return a + b;
  return a + '/' + b;
}

const escapeName = (s: string) => s.replace(/[^A-Za-z0-9_-]*/g, '');
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Outlet: LiveComponent<any> = () => {
  const context = useContext(RouteContext);
  return context.routes ? use(Routes)(context) : null;
}

const USE_OUTLET = use(Outlet)();

export const Routes: LiveComponent<RoutesProps> = memo((props) => {
  const {
    routes,
    base = NO_PATH,
  } = props;

  const {route: routeState} = useContext(RouterContext);
  const {path: currentPath} = routeState;

  const matchers = useMemo(() => {
    const matchers = [] as Matcher[];

    for (const path in routes) {
      const {element, routes: rs} = routes[path];

      const fullPath = joinPath(base, path);
      const regexp = pathSpecToRegexp(fullPath);

      matchers.push({
        regexp,
        element,
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
    let element = null as LiveElement<any>;

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

  if (element) return provide(RouteContext, context, morph(element));
  if (context.routes) return use(Routes)(context);
  return null;
}, 'Routes');

export const pathSpecToRegexp = (s: string) => {
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

  const isFolder = s[s.length - 1] === '/';
  if (!isFolder) regexp += '(/|$)';

  return new RegExp(regexp);
}
