import type { StorageSource, UniformAttribute } from './types';
import { toTypeString } from './uniform';

export const checkStorageTypes = (
  attributes: UniformAttribute[],
  links: Record<string, StorageSource | null | undefined>,
) => {
  for (const u of attributes) {
    const link = links[u.name];
    checkStorageType(u, link)
  }
}

export const checkStorageType = (
  attribute: UniformAttribute,
  link: StorageSource | null | undefined,
) => {
  if (!link) return

  const {name, format: from} = attribute;
  const to = link.format;

  if (Array.isArray(from) || Array.isArray(to)) return;

  const fromName = toTypeString(from);
  const toName = toTypeString(to);

  let f = fromName;
  let t = toName;
  
  if (t == null || f === t) return;

  // Remove array<atomic<..>>
  f = f.replace(/^array?/, '').replace(/^<(.*)>$/g, '$1');
  f = f.replace(/^atomic?/, '').replace(/^<(.*)>$/g, '$1');
  t = t.replace(/^array?/, '').replace(/^<(.*)>$/g, '$1');
  t = t.replace(/^atomic?/, '').replace(/^<(.*)>$/g, '$1');

  // Remove vec<..> to allow for automatic widening/narrowing
  f = f.replace(/^vec[0-9](to[0-9])?/, '').replace(/^<(.*)>$/g, '$1');
  t = t.replace(/^vec[0-9](to[0-9])?/, '').replace(/^<(.*)>$/g, '$1');

  // Shorthand
  if (f.match(/^uif$/)) f += '32';
  if (f.match(/^h$/))   f = 'f16';
  if (t.match(/^uif$/)) t += '32';
  if (t.match(/^h$/))   t = 'f16';
  if (f === t) return;

  // Remove bit size to allow for automatic widening/narrowing
  const fromScalar = f.replace(/([uif])([0-9]+)/, '$1__');
  const toScalar   = t.replace(/([uif])([0-9]+)/, '$1__');
  if (fromScalar === toScalar) return;

  // uppercase = struct type, allow any
  if (fromName.match(/[A-Z]/) && toName) return;

  console.warn(`Invalid format '${to}' bound for ${from} "${name}" (${fromScalar} != ${toScalar})`);
}
