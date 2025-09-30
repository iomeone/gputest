import type { LiveElement, RenderProp } from '@use-gpu/live';
import { yeet, useHooks, useNoHooks, useMemo, useNoMemo, formatValue } from '@use-gpu/live';

export type RenderProps<T extends any[]> = {
  render?: (...t: T) => LiveElement,
  children?: (...t: T) => LiveElement,
};

export type MaybeRenderProps<T extends any[]> = {
  render?: (...t: T) => LiveElement,
  children?: LiveElement | ((...t: T) => LiveElement),
};

export const useRenderProp = <T extends any[]>(props: RenderProps<T>, ...args: T): LiveElement => {
  const call = getRenderFunc(props);
  if (!call && props.children)  throw new Error(`Expected render function as children, got: ${formatValue(props.children)}`);

  const rendered = call ? useHooks(() => call(...args), [call, ...args]) : (useNoHooks(), null);
  const returned = !call ? useMemo(() => yeet(...args), args) : (useNoMemo(), null);

  return call ? rendered : returned;
};

export const getRenderFunc = <T extends any[]>(props: MaybeRenderProps<T>): RenderProp<T> | null | undefined => {
  const {render, children} = props;
  if (typeof children === 'function') return children;
  if (render) return render;
  return null;
};
