import { FormatLike, TypeLike } from '../types';

const ARRAY_REGEXP = /\[[^\]]+\]/;

export const toTypeString = (t: any): string => {
  if (typeof t === 'string') return t;
  if (t.name) return t.name;
  return t as any;
}

export const toTypeArgs = (t: any[]): any[] => {
  return t?.map(toTypeString) ?? [];
};

export const toTypeSymbol = (t: TypeLike): FormatLike<string> => {
  let type = toTypeString(t);
  if (!type.match(/[A-Z]/)) return {format: type};

  let depth = 0;
  while (type.match(ARRAY_REGEXP)) {
    type = type.replace(ARRAY_REGEXP, '');
    depth++;
  }

  if (depth === 0) return {format: 'T', type};
  if (depth === 1) return {format: 'array<T>', type};

  throw new Error(`GLSL array depth > 1 unsupported`);
};
