import type { LiveComponent, LiveElement } from '../../live';
import type { StorageSource, LambdaSource, Lazy, TensorArray } from '../../core';
import type { ShaderSource, ShaderModule } from '../../shader';

import { useMemo } from '../../live';
import { bundleToAttribute, bundleToAttributes, chainTo } from '../../shader/wgsl';

import { useShaderRefs } from '../hooks/useShaderRef';
import { useLambdaSource } from '../hooks/useLambdaSource';
import { useRawTensorSource, useNoRawTensorSource } from '../hooks/useRawSource';
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

The provided shader is combined with the source's getter and must have a matching type, i.e. (t: SourceType) -> TargetType.

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
    const bindings = bundleToAttributes(shader);

    const allArgs = [...argRefs, ...sources];
    const values = bindings.map(() => allArgs.shift());

    const def = bundleToAttribute(shader);
    const input = {name: 'source', format: def.args?.[0] ?? def.format};

    return chainTo(getSource(input, source), getShader(shader, values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shader, source, sources, args.length]);

  const output = useLambdaSource(getData, source ?? NO_SOURCE);

  return useRenderProp(props, output);
};
