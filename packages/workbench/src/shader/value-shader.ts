import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, LambdaSource, Lazy, TensorArray } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { bundleToAttribute, bundleToAttributes, chainTo } from '@use-gpu/shader/wgsl';

import { useShaderRefs } from '../hooks/useShaderRef';
import { useLambdaSource } from '../hooks/useLambdaSource';
import { useRawTensorSource, useNoRawTensorSource } from '../hooks/useRawSource';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { getSource } from '../hooks/useSource';
import { getShader } from '../hooks/useShader';
import { useRenderProp } from '../hooks/useRenderProp';

export type ValueShaderProps = {
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

/** Map the values inside a data source.

The provided shader is combined with the source's getter and must have the same return type, i.e. (t: T) -> T.

Unnamed arguments are linked in the order of: args, sources, source | data.
*/
export const ValueShader: LiveComponent<ValueShaderProps> = (props) => {
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

    const allArgs = [...argRefs, ...sources];
    const values = bindings.map(b => {
      return allArgs.shift();
    });

    const def = bundleToAttribute(shader);
    return chainTo(getSource(def, source), getShader(shader, values));
  }, [shader, args.length, source, sources]);

  const output = useLambdaSource(getData, source ?? NO_SOURCE);

  return useRenderProp(props, output);
};
