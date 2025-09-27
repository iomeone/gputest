import { formatNodeName } from './debug';
import { capture, gather, multiGather, mapReduce, morph, provide, yeet, CAPTURE, FRAGMENT, GATHER, MAP_REDUCE, MULTI_GATHER, PROVIDE, YEET, MORPH } from './builtin';
import { getCurrentFiberID } from './current';
import { DeferredCall, ArrowFunction, LiveNode, LiveElement, ReactElementInterop } from './types';

const NO_PROPS: any[] = [{}];

const toChildren = <T>(t: T[]): T[] | T | undefined => {
  if (t.length === 1) return t[0];
  if (t.length) return t;
  return undefined;
};

type AnyF = (...args: any[]) => any;

export const Fragment = FRAGMENT as AnyF;
export const Gather = GATHER as AnyF;
export const MultiGather = MULTI_GATHER as AnyF;
export const MapReduce = MAP_REDUCE as AnyF;
export const Provide = PROVIDE as AnyF;
export const Capture = CAPTURE as AnyF;
export const Yeet = YEET as AnyF;
export const Morph = MORPH as AnyF;

export const React = {
  createElement: (type: ArrowFunction, props: any, ...children: any[]) => {
    const by = getCurrentFiberID();

    if ((type as any)?.isLiveBuiltin) {
      if (type === FRAGMENT) {
        return children;
      }
      if (type === GATHER) {
        return gather(toChildren(children), props?.then, props?.key);
      }
      if (type === MULTI_GATHER) {
        return multiGather(toChildren(children), props?.then, props?.key);
      }
      if (type === MAP_REDUCE) {
        return mapReduce(toChildren(children), props?.map, props?.reduce, props?.then, props?.key);
      }
      if (type === PROVIDE) {
        return provide(props.context, props.value, toChildren(children), props?.key);
      }
      if (type === CAPTURE) {
        return capture(props.context, toChildren(children), props.then, props?.key);
      }
      if (type === YEET) {
        return yeet(children[0], props?.key);
      }
      if (type === MORPH) {
        if (children.length === 1) return morph(children[0]);
        return children.map(morph);
      }
      throw new Error("Builtin `${formatNodeName({f: type})}` unsupported in JSX. Use raw function syntax instead.");
    }

    if (props) {
      if (props.children == null) props.children = toChildren(children);
      return {f: type, args: [props], key: props.key, by};
    }
    else if (children.length) {
      return {f: type, args: [{children: toChildren(children)}], key: undefined, by};
    }
    else {
      return {f: type, args: NO_PROPS, key: undefined, by};
    }
  },
  Fragment,
  Gather,
  MultiGather,
  MapReduce,
  Provide,
  Capture,
  Yeet,
  Morph,
};

export default React;
