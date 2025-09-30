import type { LC, LiveElement } from '../../live';
import type { ColorLike, XYZW } from '../../core';
import type { ShaderSource } from '../../shader';

import { useOne } from '../../live';
import { useProp } from '../../traits/live';
import { parseColor } from '../../parse';

import { useShader } from '../hooks/useShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { useShaderRef } from '../hooks/useShaderRef';

import { ShaderFlatMaterial } from './shader-flat-material';

import { getBasicMaterial } from '../../wgsl/material/basic-material.wgsl';

export type BasicMaterialProps = {
  color?: ColorLike,
  colorMap?: ShaderSource,

  render?: (material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement,
  children?: LiveElement | ((material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement),
};

const WHITE = [1, 1, 1, 1] as XYZW;

export const BasicMaterial: LC<BasicMaterialProps> = (props: BasicMaterialProps) => {
  const {
    //color,
    colorMap,

    render,
    children,
  } = props;

  const color = useProp(props.color, parseColor, WHITE);

  const t = useNativeColorTexture(colorMap);

  const c = useShaderRef(color);
  const cm = useShaderRef(null, t);

  const defines = useOne(() => ({
    HAS_COLOR_MAP: !!colorMap,
  }), colorMap);

  const getFragment = useShader(getBasicMaterial, [c, cm], defines);

  return ShaderFlatMaterial({
    fragment: getFragment,
    render,
    children,
  });
}
