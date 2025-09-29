import type { LC, LiveElement, PropsWithChildren } from '../../live';
import type { Point4 } from '../../core';
import type { ShaderModule, ShaderSource } from '../../shader';
import type { ColorLike } from '../../traits';

import { provide, yeet, signal, useMemo, useOne } from '../../live';
import { parseColor, useProp } from '../../traits';
import { bindBundle } from '../../shader/wgsl';

import { useBoundShader, useNoBoundShader } from '../hooks/useBoundShader';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { useShaderRef } from '../hooks/useShaderRef';
import { useLightContext } from '../providers/light-provider';
import { MaterialContext } from '../providers/material-provider';

import { ShaderFlatMaterial } from './shader-flat-material';

import { getBasicMaterial } from '../../gen-wgsl/material/basic-material';
import { getSolidSurface } from '../../gen-wgsl/instance/surface/solid';
import { getSolidFragment } from '../../gen-wgsl/instance/fragment/solid';

export type BasicMaterialProps = {
  color?: ColorLike,
  colorMap?: ShaderSource,

  render?: (material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement,
};

const WHITE = [1, 1, 1, 1] as Point4;

export const BasicMaterial: LC<BasicMaterialProps> = (props: PropsWithChildren<BasicMaterialProps>) => {
  const {
    //color,
    colorMap,

    render,
    children,
  } = props;

  const color = useProp(props.color, parseColor, WHITE);

  const t = useNativeColorTexture(colorMap);

  const c = useShaderRef(color);
  let cm = useShaderRef(null, t);

  const defines = useOne(() => ({
    HAS_COLOR_MAP: !!colorMap,
  }), colorMap);

  const getFragment = useBoundShader(getBasicMaterial, [c, cm], defines);

  return ShaderFlatMaterial({
    fragment: getFragment,
    render,
    children,
  });
}
