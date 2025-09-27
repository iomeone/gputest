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
  const {f, arg, args} = node;

  // @ts-ignore
  let name = (f?.displayName ?? f?.name) || 'Node';
  if (name === 'PROVIDE' && args) {
    const [context] = args;
    const value = formatValue(context.displayName);
    return `Provide(${value})`;
  }
  else if (name === 'CONSUME' && args) {
    const [context] = args;
    const value = formatValue(context.displayName);
    return `Consume(${value})`;
  }
  else if (name === 'DETACH' && args) {
    const [call] = args;
    // @ts-ignore
    name = `Detach(${(call.f?.displayName ?? call.f?.name) || 'Node'})`;
  }
  else if (name === 'GATHER') {
    name = `Gather`;
  }
  else if (name === 'MULTI_GATHER') {
    name = `MultiGather`;
  }
  else if (name === 'FRAGMENT') {
    name = `Fragment`;
  }
  else if (name === 'MAP_REDUCE') {
    name = `MapReduce`;
  }
  else if (name === 'YEET') {
    name = `Yeet`;
  }
  else if (name === 'MORPH') {
    name = `Morph`;
  }
  else if (name === 'DEBUG') {
    name = `Debug`;
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
    if (node.f) {
      if (node.f.name === 'REDUCE') {
        const [, reduce, initial] = node.args;
        args.push(formatValue({reduce, initial}));
      }
      else if (node.f.name === 'PROVIDE') {
        const [context,,, isMemo] = node.args;
        args.push(formatValue(context));
      }
      else if (node.f.name === 'MORPH') {
        args.push(formatValue(node.args));
      }
      else {
        if (Array.isArray(node.args)) {
          args.push(...node.args?.map(x => formatValue(x)));
        }
      }
    }
    else {
      if (Array.isArray(node.args)) {
        args.push(...node.args?.map(x => formatValue(x)));
      }
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
    if (signature === 'f/args/key/by' || signature === 'f/arg/key/by') return formatNode(x);

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
  if (Array.isArray(x)) return '[' + x.map((x) => formatShortValue(x, seen)).join(', ') + ']';
  if (typeof x === 'boolean') return x ? 'true' : 'false';
  if (typeof x === 'number') return formatNumber(x, 5);
  if (typeof x === 'symbol') return '(symbol)';
  if (typeof x === 'string') return x;
  if (typeof x === 'function') {
    if (x.name === '' && !x.displayName) x.displayName = '#' + Math.round(Math.random() * 10000);
    const name = x.displayName ?? x.name;
    const body = x.toString().split(/=>/)[1];
    return `${name}(…) ` + truncate(body, 40);
  }
  if (typeof x === 'object') {
    const signature = Object.keys(x).join('/');
    if (signature === 'f/args/key' || signature === 'f/arg/key') return `<${formatNodeName(x)} …/>`;

    return '{...}';
  }
  return '' + x;
}

export const formatNumber = (x: number, precision: number = 5) => {
  if (Math.abs(x) < 1) return x.toPrecision(precision).replace(/(?:\.0+)$|(\.[0-9]*[1-9])0+$/, '$1');
  return x.toString();
};

const truncate = (s: string, n: number) => {
  if (typeof s !== 'string') return '' + s;
  s = s.replace(/\s+/g, ' ');
  if (s.length < n) return s;
  return s.slice(0, n) + '…';
}