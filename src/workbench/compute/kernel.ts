import type { LiveComponent, LiveElement, Ref } from '@use-gpu/live';
import type { StorageSource, Lazy, UniformAttributeValue } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { yeet, useMemo, useNoMemo, useOne, useRef } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';
import { bundleToAttribute, getBundleEntry } from '@use-gpu/shader/wgsl';
import { getBoundShader } from '../hooks/useBoundShader';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { useShaderRefs } from '../hooks/useShaderRef';

import { useComputeContext } from '../providers/compute-provider';
import { useFeedbackContext, useNoFeedbackContext } from '../providers/feedback-provider';
import { RenderContext } from '../providers/render-provider';

import { dispatch } from '../queue/dispatch';

export type KernelProps = {
  shader: ShaderModule,
  source?: ShaderSource,
  sources?: ShaderSource[],
  args?: Lazy<any>[],
  initial?: boolean,
  history?: boolean | number,
  size?: Lazy<number[]>,
  swap?: boolean,
};

const NO_SOURCES: StorageSource[] = [];

/** Runs a compute kernel on the current compute context.

Provides:
- `@link fn getSize() -> vec2<u32> {};`

Unnamed arguments linked in the order of: args, sources, source, targets, history.
*/
export const Kernel: LiveComponent<KernelProps> = (props) => {
  const {
    shader,
    source,
    sources = NO_SOURCES,
    args = NO_SOURCES,
    size,
    initial,
    history,
    swap = true,
  } = props;

  const targets = useComputeContext();
  const argRefs = useShaderRefs(...args);

  const [dispatchKernel, dispatchSize] = useMemo(() => {
    const entry = getBundleEntry(shader);
    const symbol = bundleToAttribute(shader, entry);

    const workgroupAttr = symbol.attr?.find(({name}) => name === 'workgroup_size')?.args ?? [];
    const workgroupSize = workgroupAttr.map(s => parseInt(s) || 1);

    const dataSize = () => resolve(size) ?? targets[0]?.size;
    const dispatchSize = () => {
      const [w, h, d] = dataSize();
      return [
        Math.ceil(w / (workgroupSize[0] || 1)),
        Math.ceil(h / (workgroupSize[1] || 1)),
        Math.ceil(d / (workgroupSize[2] || 1)),
      ];
    };

    const f = history ? targets.flatMap(
      t => (
        typeof history === 'number'
        ? t?.history?.slice(0, history)
        : t?.history
      ) as StorageSource[] | null
    ) : NO_SOURCES;
    const s = (source ? [source] : NO_SOURCES).map(s => ((s as any)?.buffer)
      ? getDerivedSource(s as any, {readWrite: false}) : s);

    const values = [dataSize, ...argRefs, ...sources, ...s, ...targets, ...f];

    const kernel = getBoundShader(shader, values);
    return [kernel, dispatchSize];
  }, [shader, targets, source, sources, argRefs, history]);

  let first = useRef(true);
  initial ? useMemo(() => { first.current = true; }, targets) : useNoMemo();

  const shouldDispatch = initial ? () => {
    if (!first.current) return false;
    first.current = false;
  } : undefined;

  const onDispatch = () => {
    if (swap) for (const t of targets) if (t.swap) t.swap();
  };

  return yeet(dispatch({
    shader: dispatchKernel,
    size: dispatchSize,
    shouldDispatch,
    onDispatch,
  }));
};
