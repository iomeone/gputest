import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, LambdaSource, Lazy, TensorArray } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';

import { useShaderRefs } from '../hooks/useShaderRef';
import { useLambdaSource } from '../hooks/useLambdaSource';
import { useRawTensorSource, useNoRawTensorSource } from '../hooks/useRawSource';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { getShader } from '../hooks/useShader';
import { useRenderProp } from '../hooks/useRenderProp';

export type DataShaderProps = {
  data?: TensorArray,
  source?: StorageSource | LambdaSource,
  shader: ShaderModule,

  sources?: ShaderSource[],
  args?: Lazy<any>[],

  render?: (source: LambdaSource) => LiveElement,
  children?: (source: LambdaSource) => LiveElement,
};

const NO_SOURCES: ShaderSource[] = [];
const NO_SOURCE = { length: 0, size: [0] };

/** Sample shader for sampling of a linear input buffer.

Provides:
- `@optional @link fn getDataSize() -> vec4<f32>`
- `@optional @link fn getData(i: u32) -> T` where `T` is the source format.

Unnamed arguments are linked in the order of: args, sources, source | data.
*/
export const DataShader: LiveComponent<DataShaderProps> = (props) => {
  const {
    data,
    shader,
    sources = NO_SOURCES,
    args = NO_SOURCES,
  } = props;

  const argRefs = useShaderRefs(...args);

  const source = data ? useRawTensorSource(data) : (useNoRawTensorSource(), props.source);

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
      const k = b.name;
      return links[k] ? links[k] : allArgs.shift();
    });

    return getShader(shader, values);
  }, [shader, args.length, source, sources]);

  const output = useLambdaSource(getData, source ?? NO_SOURCE);

  return useRenderProp(props, output);
};
