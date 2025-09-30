import { FormatLike, TypeLike, ParameterLike } from '../types';

const ARRAY_REGEXP = /^array<([^>]+)>$/;

export const getTypeName = (s: string) => {
  const i = s.indexOf('<');
  return i >= 0 ? s.slice(0, i) : s;
};

export const getAttributeName = (s: string) => {
  const i = s.indexOf('(');
  return i >= 0 ? s.slice(0, i) : s;
};

export const getAttributeArgs = (s: string) => {
  const i = s.indexOf('(');
  const j = s.lastIndexOf(')');
  if (i >= 0 && j >= 0) return s.slice(i + 1, j);
  return null;
};

export const toTypeString = (t: TypeLike): string => {
  if (typeof t === 'object') return t.name;
  return t;
};

export const toTypeArgs = (t: ParameterLike[]): string[] => {
  return t?.map(p => typeof p === 'object' ? toTypeString(p.type) : p) ?? [];
};

export const toTypeSymbol = (t: TypeLike): FormatLike<string> => {
  let type = toTypeString(t);
  if (!type.match(/[A-Z]/)) return {format: type};

  let depth = 0;
  while (type.match(ARRAY_REGEXP)) {
    type = type.replace(ARRAY_REGEXP, '$1');
    depth++;
  }

  if (depth === 0) return {format: 'T', type};
  if (depth === 1) return {format: 'array<T>', type};

  throw new Error(`WGSL array depth > 1 unsupported`);
};
