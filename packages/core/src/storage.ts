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
  const {name, format: from} = attribute;
  const to = link?.format;

  if (Array.isArray(from) || Array.isArray(to)) return;

  const fromName = toTypeString(from);
  const toName = toTypeString(to);

  let f = fromName;
  let t = toName;

  if (link && t != null && f !== t) {

    // Remove array<atomic<..>>
    f = f.replace(/array?/, '').replace(/^<|>$/g, '');
    f = f.replace(/atomic?/, '').replace(/^<|>$/g, '');
    t = t.replace(/array?/, '').replace(/^<|>$/g, '');
    t = t.replace(/atomic?/, '').replace(/^<|>$/g, '');

    // Remove vec<..> to allow for automatic widening/narrowing
    f = f.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, '');
    t = t.replace(/vec[0-9](to[0-9])?/, '').replace(/^<|>$/g, '');

    // Shorthand
    if (f.match(/^uif$/)) f += '32';
    if (f.match(/^h$/))   f = 'f16';
    if (t.match(/^uif$/)) t += '32';
    if (t.match(/^h$/))   t = 'f16';

    if (f !== t) {
      // Remove bit size to allow for automatic widening/narrowing
      const fromScalar = f.replace(/([uif])([0-9]+)/, '$1__');
      const toScalar   = t.replace(/([uif])([0-9]+)/, '$1__');

      if (fromScalar !== toScalar) {
        // uppercase = struct type, allow any
        if (fromName.match(/[A-Z]/) && toName) return;

        console.warn(`Invalid format ${to} bound for ${from} "${name}" (${fromScalar} != ${toScalar})`);
      }
    }
  }
}
