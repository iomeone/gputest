import type { LiveComponent } from '@use-gpu/live';
import type { StorageSource, Lazy, VectorLike } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { yeet, useMemo, useNoMemo, useRef } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';
import { bundleToAttribute, getBundleEntry } from '@use-gpu/shader/wgsl';
import { getShader } from '../hooks/useShader';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { useShaderRefs } from '../hooks/useShaderRef';

import { useComputeContext } from '../providers/compute-provider';

import { dispatch } from '../queue/dispatch';

export type KernelProps = {
  shader: ShaderModule,
  source?: ShaderSource,
  sources?: ShaderSource[],
  args?: Lazy<any>[],
  initial?: boolean,
  history?: boolean | number,
  size?: Lazy<number[] | VectorLike>,
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

  const [dispatchKernel, dataSize, workgroupSize] = useMemo(() => {
    const entry = getBundleEntry(shader);
    const symbol = bundleToAttribute(shader, entry);

    const workgroupAttr = symbol.attr?.find((attr) => attr.match(/^workgroup_size\(/));
    const workgroupArgs = workgroupAttr?.split(/[()]/g)[1] ?? '';
    const workgroupSize = workgroupArgs.split(',').map(s => parseInt(s) || 1);

    const dataSize = () => resolve(size) ?? targets[0]?.size;

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

    const kernel = getShader(shader, values);
    return [kernel, dataSize, workgroupSize];
  }, [shader, targets, source, sources, argRefs, history]);

  const firstRef = useRef(true);
  initial ? useMemo(() => { firstRef.current = true; }, targets) : useNoMemo();

  const shouldDispatch = initial ? () => {
    if (!firstRef.current) return false;
    firstRef.current = false;
  } : undefined;

  const onDispatch = () => {
    if (swap) for (const t of targets) if (t.swap) t.swap();
  };

  return yeet(dispatch({
    shader: dispatchKernel,
    size: dataSize,
    group: workgroupSize,
    shouldDispatch,
    onDispatch,
  }));
};
