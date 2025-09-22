import { DeferredCall, LiveFiber } from './types';

const {prototype: {hasOwnProperty}} = Object;

export const formatTree = (root: LiveFiber<any>, depth: number = 0): string => {
  const {mount, mounts, next} = root;
  let out = [];

  const prefix = '  '.repeat(depth);
  out.push(prefix + formatNode(root));

  if (mount) {
    out.push(formatTree(mount, depth + +!!mounts));
  }

  if (mounts) {
    for (const key of mounts.keys()) {
      const sub = mounts.get(key);
      if (sub) out.push(formatTree(sub, depth + 1));
    }
  }

  if (next) {
    out.push(formatTree(next, depth + 1));
  }

  return out.join("\n");
}

export const formatNodeName = <F extends Function>(node: DeferredCall<F>): string => {
  const {f, args} = node;

  // @ts-ignore
  let name = (f?.displayName ?? f?.name) || 'Node';
  if (name === 'PROVIDE' && args) {
    const [context,,, isMemo] = args;
    const value = formatValue(context.displayName);
    return isMemo ? `ProvideMemo(${value})` : `Provide(${value})`;
  }
  else if (name === 'CONSUME' && args) {
    const [context] = args;
    const value = formatValue(context.displayName);
    return `Consume(${value})`;
  }
  else if (name === 'DETACH' && args) {
    const [call] = args;
    name = `Detach(${formatValue(call.f)})`;
  }
  else if (name === 'GATHER' && args) {
    name = `[Gather]`;
  }
  else if (name === 'MULTI_GATHER' && args) {
    name = `[MultiGather]`;
  }
  else if (name === 'RECONCILE' && args) {
    name = `[Reconcile]`;
  }
  else if (name === 'MAP_REDUCE' && args) {
    name = `[MapReduce]`;
  }
  else if (name === 'YEET' && args) {
    name = `[Yeet]`;
  }

  return name;
}

export const formatNode = <F extends Function>(node: DeferredCall<F>): string => {
  const name = formatNodeName(node);

  const args = [] as string[];
  if (node.arg !== undefined) {
    args.push(formatValue(node.arg));
  }
  if (node.args !== undefined) {
    if (node.f.name === 'REDUCE') {
      const [, reduce, initial] = node.args;
      args.push(formatValue({reduce, initial}));
    }
    else if (node.f.name === 'PROVIDE') {
      const [context,,, isMemo] = node.args;
      args.push(formatValue(context));
    }
    else {
      args.push(...node.args?.map(x => formatValue(x)));
    }
  }
  if (args?.length) args.unshift('');

  return `<${name}${args ? args.join(' ') : ''}>`;
}

export const formatValue = (x: any, seen: WeakMap<object, boolean> = new WeakMap()): string => {
  if (!x) return '' + x;
  if (Array.isArray(x)) {
    if (seen.get(x)) return '[Repeated]';
    seen.set(x, true);

    const out = [];
    for (const k in x) if (hasOwnProperty.call(x, k)) {
      out.push(`${formatShortValue(x[k], seen)}`);
    }
    return '[' + out.join(', ') + ']';
  }
  if (typeof x === 'object') {
    if (seen.get(x)) return '[Repeated]';
    seen.set(x, true);

    const signature = Object.keys(x).join('/');
    if (signature === 'f/args/key' || signature === 'f/arg/key') return formatNode(x);

    const out = [];
    for (const k in x) if (hasOwnProperty.call(x, k)) {
      out.push(`${k}: ${formatShortValue(x[k], seen)}`);
    }
    
    const proto = x.__proto__ !== Object.prototype ? x.__proto__.constructor.name : '';
    return proto + '{' + out.join(', ') + '}';
  }
  return formatShortValue(x, seen);
}

export const formatShortValue = (x: any, seen: WeakMap<object, boolean> = new WeakMap()): string => {
  if (!x) return '' + x;
  if (Array.isArray(x)) return '[' + x.map((x) => formatValue(x, seen)).join(', ') + ']';
  if (typeof x === 'boolean') return x ? 'true' : 'false';
  if (typeof x === 'number') return '' + x;
  if (typeof x === 'symbol') return '(symbol)';
  if (typeof x === 'string') return x;
  if (typeof x === 'function') {
    if (x.name === '' && !x.displayName) x.displayName = Math.round(Math.random() * 10000);
    const name = x.displayName ?? x.name;
    const body = x.toString().split(/=>/)[1];
    return `${name}(…) ` + body;
  }
  if (typeof x === 'object') {
    const signature = Object.keys(x).join('/');
    if (signature === 'f/args/key' || signature === 'f/arg/key') return `<${formatNodeName(x)} …/>`;

    return '{...}';
  }
  return '' + x;
}