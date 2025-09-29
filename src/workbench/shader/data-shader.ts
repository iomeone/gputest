import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, Lazy } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { yeet, useMemo, useYolo } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';

import { useShaderRefs } from '../hooks/useShaderRef';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { getBoundShader } from '../hooks/useBoundShader';

export type DataShaderProps = {
  source?: StorageSource,
  shader: ShaderModule,

  sources?: ShaderSource[],
  args?: Lazy<any>[],

  render?: (source: ShaderModule) => LiveElement,
};

const NO_SOURCES: ShaderSource[] = [];

/** Sample shader for sampling of a linear input buffer.

Provides:
- `@optional @link fn getDataSize() -> vec4<f32>`
- `@optional @link fn getData(i: u32) -> T` where `T` is the source format.

Unnamed arguments are linked in the order of: args, sources, source.
*/
export const DataShader: LiveComponent<DataShaderProps> = (props) => {
  const {
    source,
    shader,
    sources = NO_SOURCES,
    args = NO_SOURCES,
    render,
  } = props;

  const argRefs = useShaderRefs(...args);

  const getData = useMemo(() => {
    const s = (source ? [source] : NO_SOURCES).map(s => ((s as any)?.buffer)
      ? getDerivedSource(s as any, {readWrite: false}) : s);

    const bindings = bundleToAttributes(shader);
    const links = {
      getData: s[0],
      getDataSize: () => source?.size,
    } as Record<string, any>;

    const allArgs = [...argRefs, ...sources];

    const values = bindings.map(b => {
      let k = b.name;
      return links[k] ? links[k] : allArgs.shift();
    });

    return getBoundShader(shader, values);
  }, [shader, args.length, source, sources]);

  return useYolo(() => render ? render(getData) : yeet(getData), [render, getData]);
};
