import { TypeLike } from '../types';

export const toTypeString = (t: TypeLike | string): string => {
  if (typeof t === 'object') {
    if (t.type) return toTypeString(t.type);
    if (t.args) return `${t.name}<${t.args.map(t => toTypeString(t)).join(',')}>`;
    else return t.name;
  }
  return t;
}

export const toTypeArgs = (t: (TypeLike | string)[]): string[] => {
  return t?.map(toTypeString) ?? [];
}

