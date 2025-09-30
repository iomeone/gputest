import type { LiveFunction, LiveFiber } from './types';
import { useFiber, useResource } from './hooks';
import { bind, enterFiber, exitFiber, disposeFiber } from './fiber';
import { renderFibers } from './tree';

const MARKER = 'Live/HMR-v1';

/** Hot-reload an App root with a webpack/vite-compatible module interface.

Will discard all prior state and do a full re-render.
```
const App = () => { ... };
export default hot(App, module);
```
*/
export const hot = (fn: LiveFunction<any>, mod: any) => {

  const fibers: Set<LiveFiber<any>> = new Set();

  // Resolve HMR API from either a webpack-like `module` (`module` or `module.hot`)
  // or an HMR object passed in by Vite (e.g. `import.meta` or `import.meta.hot`).
  // We avoid referencing `import.meta` here so that TypeScript won't error
  // for webpack-style builds on older module systems.
  const hot = mod ? (((mod as any).hot ?? (mod as any)) as any) : undefined;
  if (!hot) return fn;

  const wrapped = new Proxy((...args: any[]) => {
    const fiber = useFiber();
    useResource((dispose) => {
      fibers.add(fiber);
      dispose(() => fibers.delete(fiber));
    });
    return fn(...args);
  }, {
    get: (target, prop) => {
      if (prop === 'name') return fn.displayName ?? fn.name;
      return (target as any)[prop];
    },
  });

  const data = (hot as any).data;
  if (data && data.marker !== MARKER) {
    // Vite's HMR runtime's methods (`accept`, `dispose`, `invalidate`, etc.) require `this` to be the hot object
    (hot as any).invalidate?.();
  }
  else {
    (hot as any).dispose?.((data: any) => {
      data.marker = MARKER;
      data.fibers = Array.from(fibers);
    });
    (hot as any).accept?.();

    if (data && data.fibers) {
      for (const f of data.fibers) {
        fibers.add(f);

        enterFiber(f, 0);
        exitFiber(f);
        disposeFiber(f);

        f.f = wrapped;
        f.bound = bind(wrapped, f);
        f.type = null;

        renderFibers(f.host, [f]);
      }
    }
  }

  return wrapped;
};
