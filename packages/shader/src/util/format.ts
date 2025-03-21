import type { ShaderModule, UniformFormat } from '../types';
import { formatMurmur53 } from './hash';
import { getBundleEntry, getBundleKey } from './bundle';

export const flattenFormat = (format: UniformFormat, type?: ShaderModule): string => {
  if (type) return formatMurmur53(getBundleKey(type));
  if (typeof format === 'string') return format;
  if (Array.isArray(format)) return `[${format.map(f => flattenFormat(f.format, f.type)).join(' ')}]`;
  return 'unknown';
};

export const formatFormat = (format: UniformFormat, type?: ShaderModule): string => {
  if (type) {
    const t = getBundleEntry(type) ?? 'unknown';
    if (format === 'T') return t;
    if (format === 'array<T>') return `array<${t}>`;
    throw new Error(`Unknown format ${format}`);
  }
  if (typeof format === 'string') return format;
  if (Array.isArray(format)) return `[${format.map(f => formatFormat(f.format, f.type)).join(' ')}]`;
  return 'unknown';
};