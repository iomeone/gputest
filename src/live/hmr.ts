import type { LiveFunction, LiveFiber } from './types';
import { useFiber, useResource } from './hooks';
import { bind, enterFiber, exitFiber, disposeFiber } from './fiber';
import { renderFibers } from './tree';

const MARKER = 'Live/HMR-v1';

/** Hot-reload an App root with a webpack-compatible module interface.

Will discard all prior state and do a full re-render.
```
const App = () => { ... };
export default hot(App, module);
```
*/
export const hot = (fn: LiveFunction<any>, mod: any) => {

  const fibers: Set<LiveFiber<any>> = new Set();

  const {hot} = mod;
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

  const {accept, dispose, data, invalidate} = hot;
  if (data && data.marker !== MARKER) {
    invalidate();
  }
  else {
    dispose((data: any) => {
      data.marker = MARKER;
      data.fibers = Array.from(fibers);
    });
    accept();

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
