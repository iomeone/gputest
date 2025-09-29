import { formatNodeName } from './debug';
import {
  capture, fence, gather, multiGather, mapReduce, morph, provide, yeet, quote, unquote, reconcile, suspend, signal,
  CAPTURE, FENCE, GATHER, MULTI_GATHER, MAP_REDUCE, MORPH, PROVIDE, YEET, FRAGMENT, QUOTE, UNQUOTE, RECONCILE, SUSPEND, SIGNAL,
} from './builtin';
import { getCurrentFiberBy } from './current';
import { DeferredCall, ArrowFunction, LiveNode, LiveElement, ReactElementInterop } from './types';

const NO_PROPS: any = {};

const toChildren = <T>(t: T | T[]): T | T[] | undefined => {
  if (Array.isArray(t)) {
    if (t.length === 1) return t[0];
    if (t.length) return t;
  }
  else if (t != null) return t;
  return undefined;
};

type AnyF = (...args: any[]) => any;

export const Fence = FENCE as AnyF;
export const Fragment = FRAGMENT as AnyF;
export const Gather = GATHER as AnyF;
export const MultiGather = MULTI_GATHER as AnyF;
export const MapReduce = MAP_REDUCE as AnyF;
export const Provide = PROVIDE as AnyF;
export const Capture = CAPTURE as AnyF;
export const Yeet = YEET as AnyF;
export const Morph = MORPH as AnyF;
export const Suspend = SUSPEND as AnyF;
export const Signal = SIGNAL as AnyF;
export const Reconcile = RECONCILE as AnyF;
export const Quote = QUOTE as AnyF;
export const Unquote = UNQUOTE as AnyF;

export const createElement = (type: ArrowFunction, props: any, ...children: any[]) => {
  const by = getCurrentFiberBy();

  if ((type as any)?.isLiveBuiltin) {
    switch (type) {
      case FRAGMENT:
        return props?.children ?? children;

      case FENCE:
        return fence(toChildren(props?.children ?? children), props?.then, props?.fallback, props?.key);

      case GATHER:
        return gather(toChildren(props?.children ?? children), props?.then, props?.fallback, props?.key);

      case MULTI_GATHER:
        return multiGather(toChildren(props?.children ?? children), props?.then, props?.fallback, props?.key);

      case MAP_REDUCE:
        return mapReduce(toChildren(props?.children ?? children), props?.map, props?.reduce, props?.then, props?.fallback, props?.key);

      case RECONCILE:
        return reconcile(toChildren(props?.children ?? children), props?.key);

      case PROVIDE:
        return provide(props?.context, props?.value, toChildren(props?.children ?? children), props?.key);

      case CAPTURE:
        return capture(props?.context, toChildren(props?.children ?? children), props?.then, props?.key);

      case YEET:
        return yeet((props?.children ?? children)[0], props?.key);

      case SIGNAL:
        return signal(props?.key);

      case SUSPEND:
        return suspend(props?.key);

      case QUOTE:
        return quote(toChildren(props?.children ?? children), props?.key);

      case UNQUOTE:
        return unquote(toChildren(props?.children ?? children), props?.key);

      case MORPH:
        const c = props?.children ?? children;
        if (c.length === 1) return morph(c[0]);
        return c.map(morph);

      default:
        throw new Error("Builtin `${formatNodeName({f: type})}` unsupported in JSX. Use raw function syntax instead.");
    }
  }

  if (props) {
    if (props.children == null) props.children = toChildren(children);
    return {f: type, args: [props], key: props.key, by};
  }
  else if (children.length) {
    return {f: type, args: [{children: toChildren(children)}], key: undefined, by};
  }
  else {
    return {f: type, args: [NO_PROPS], key: undefined, by};
  }
};

export const React = {
  createElement,
  Fence,
  Fragment,
  Gather,
  MultiGather,
  MapReduce,
  Provide,
  Capture,
  Yeet,
  Morph,
  Suspend,
  Signal,
  Reconcile,
  Quote,
  Unquote,
};

export default React;
