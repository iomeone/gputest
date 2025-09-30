import { Lazy } from './types';

export const resolve = <T>(x: Lazy<T>): T => {
  if (typeof x === 'function') return (x as any)();
  if (typeof x === 'object' && x != null) {
    if ('expr' in x) return x.expr();
    if ('current' in x) return x.current;
  }
  return x;
};

export const proxy = <T extends object>(target: T, override: Record<string, any>) => {
  const keys = [...new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(override)])];

  return new Proxy(target, {
    get: (target, s) => {
      if (Object.hasOwn(override, s)) return resolve((override as any)[s]);
      return (target as any)[s];
    },
    ownKeys: () => keys,
  }) as T;
};

export const lazy = <T extends object>(target: T, overrideRef: Lazy<Record<string, any>>) => {
  return new Proxy(target, {
    get: (target, s) => {
      const override = resolve(overrideRef);
      if (Object.hasOwn(override, s)) return resolve((override as any)[s]);
      return (target as any)[s];
    },
    ownKeys: (target) => {
      const override = resolve(overrideRef);
      return [...new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(override)])];
    },
  }) as T;
};

export const pick = <T>(
  count: number,
  accessor: (a: number) => T,
  skip: number = 0,
) => {
  return new Proxy([], {
    get: (target, s) => {
      if (typeof s === 'number') return accessor(s + skip);
      if (s === 'length') return count;
      return null;
    }
  });
};

