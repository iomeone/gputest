type Cache = WeakMap<any, any>;
const CACHE = new WeakMap();

export const useMemoKey = (deps: any[]) => {
  let c = CACHE;
  let e = null;
  for (const d of deps) {
    let entry = c.get(d);
    if (!entry) c.set(d, entry = new WeakMap());
    e = entry;
  }
  return e;
}
