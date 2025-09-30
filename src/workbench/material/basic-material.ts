import type { LC, LiveElement } from '@use-gpu/live';
import type { ColorLike, XYZW } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { useOne } from '@use-gpu/live';
import { useProp } from '@use-gpu/traits/live';
import { parseColor } from '@use-gpu/parse';

import { useShader } from '../hooks/useShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { useShaderRef } from '../hooks/useShaderRef';

import { ShaderFlatMaterial } from './shader-flat-material';

import { getBasicMaterial } from '@use-gpu/wgsl/material/basic-material.wgsl';

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
