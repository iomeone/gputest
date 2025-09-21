import { DeferredCall, LiveContext } from './types';

const {prototype: {hasOwnProperty}} = Object;

export const formatTree = (root: LiveContext<any>, prefix: string = ''): string => {
  const {mounts} = root;
  let out = [];
  out.push(prefix + formatNode(root));
  if (mounts) for (const key of mounts.keys()) {
    const sub = mounts.get(key);
    if (sub) out.push(formatTree(sub, prefix + '  '));
  }
  return out.join("\n");
}

export const formatNode = <F extends Function>(node: DeferredCall<F>): string => {
  const name = node.f?.name || 'Node';
  const args = node.args?.map(x => formatValue(x));
  if (args?.length) args.unshift('');
  return `<${name}${args ? args.join(' ') : ''}>`;
}

export const formatValue = (x: any, seen: WeakMap<object, boolean> = new WeakMap()): string => {
  if (!x) return x;
  if (Array.isArray(x)) return '[' + x.map((x) => formatValue(x, seen)).join(', ') + ']';
  if (typeof x === 'boolean') return x ? 'true' : 'false';
  if (typeof x === 'number') return '' + x;
  if (typeof x === 'symbol') return '(symbol)';
  if (typeof x === 'string') return x;
  if (typeof x === 'function') return `${x.name}(...)`;
  if (typeof x === 'object') {
    if (seen.get(x)) return '[Circular]';
    seen.set(x, true);

    const out = [];
    for (const k in x) if (hasOwnProperty.call(x, k)) {
      out.push(`${k}: ${formatValue(x[k], seen)}`);
    }
    return '{' + out.join(', ') + '}';
  }
  return '' + x;
}
