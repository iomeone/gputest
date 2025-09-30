import type { MemoCompare } from './types';

type Props = Record<string, any>;

export const shouldEqual = (spec: Record<string, MemoCompare>) => {
  const custom = new Set(Object.keys(spec));

  return (a: any, b: any) => {
    for (const k in spec) if (!spec[k](a[k], b[k])) return false;
    for (const k in b) if (!custom.has(k) && !Object.hasOwn(a, k)) return false;
    for (const k in a) if (!custom.has(k) && a[k] !== b[k]) return false;
    return true;
  };
};

export const sameArray = (same?: MemoCompare) => (a: any, b: any) => {
  const isA = typeof a === 'object' && 'length' in a;
  const isB = typeof b === 'object' && 'length' in b;

  return (isA && isB) ? compareArray(a, b, same) : a === b;
};

export const sameObject = (same?: MemoCompare) => (a: any, b: any) => {
  const isA = typeof a === 'object' && !!a;
  const isB = typeof b === 'object' && !!b;
  return (isA && isB) ? compareObject(a, b, same) : a === b;
};

export const sameShallow = (same?: MemoCompare) => (a: any, b: any) => (
  sameArray(same)(a, b) || sameObject(same)(a, b)
);

export const sameDeep = (same?: MemoCompare) => {
  const combined = (a: any, b: any) => (
    Array.isArray(a) && Array.isArray(b) ? compareArray(a, b, combined) :
    typeof a === 'object' && typeof b === 'object' && a && b ? compareObject(a, b, combined) :
    (same ? same(a, b) : a === b)
  );
  return combined;
};

export const sameJson = () => (a: any, b: any) => a === b || JSON.stringify(a) === JSON.stringify(b);

const compareArray = (a: any[], b: any[], same?: MemoCompare) => {
  const an = a.length;
  const bn = b.length;

  if (an !== bn) return false;
  if (same) for (let i = 0; i < an; ++i) if (!same(a[i], b[i])) return false;
  else for (let i = 0; i < an; ++i) if (a[i] !== b[i]) return false;
  return true;
};

const compareObject = (a: Props, b: Props, same?: MemoCompare) => {
  for (const k in b) if (!Object.hasOwn(a, k)) return false;
  if (same) for (const k in a) if (!same(a[k], b[k])) return false;
  else for (const k in a) if (a[k] !== b[k]) return false;
  return true;
}

