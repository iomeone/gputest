import type { LiveComponent, LiveElement } from '../../live';
import type { LambdaSource } from '../../core';

import { yeet, use, gather, provide, useContext, useMemo, useOne, tagFunction } from '../../live';
import { bindBundle, bundleToAttribute, castTo, chainTo } from '../../shader/wgsl';
import { useBoundSource, useDataBinding, useLambdaSource } from '../../workbench';

import { DataContext } from '../providers/data-provider';
import { parseAxes, parseAxis } from '../../traits';

import plotArray, { packIndex, unpackIndex } from '../../gen-wgsl/plot/array';

const SIZE_BINDING = bundleToAttribute(plotArray, 'getSize');

export type TransposeProps = {
  axes?: string,
  render?: (source: LambdaSource) => LiveElement<any>,
};

export const Transpose: LiveComponent<TransposeProps> = (props) => {
  const {
    axes = 'xyzw',
    render,
    children,
    ...rest
  } = props;

  // Grab source data
  const data = useContext(DataContext) ?? undefined;
  if (!data) return;

  const [binding, length, size] = useDataBinding(data);
  const swizzle = useOne(() => parseAxes(axes), axes);

  // Construct size + index swizzle shader
  const getSizeIn = useBoundSource(SIZE_BINDING, size);
  const getDataIn = useBoundSource(binding, data);
  const getDataOut = useMemo(() => {
    const getSizeOut = castTo(getSizeIn, 'vec4<u32>', swizzle);

    const unpack = bindBundle(unpackIndex, {getSize: getSizeOut});
    const pack = bindBundle(packIndex, {getSize: getSizeIn});

    return chainTo(chainTo(castTo(unpack, 'vec4<u32>', swizzle), pack), getDataIn);
  }, [getDataIn, getSizeIn, swizzle]);

  // Swizzle size + index locally
  const getSourceProps = useMemo(() => {
    const basis = swizzle.split('').map(parseAxis);
    return {
      length,
      size: () => {
        const s = size();
        return basis.map(i => s[i] ?? 1);
      },
    };
  }, [data, swizzle]);

  const source = useLambdaSource(getDataOut, getSourceProps);

  return useMemo(() => {
    if (render == null && children === undefined) return yeet(source);
    return (
      provide(DataContext, source, render != null ? render(source) : children)
    );
  }, [render, children, source]);
};

