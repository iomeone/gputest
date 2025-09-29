import type { LC, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { Point4 } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { ColorLike } from '@use-gpu/traits';

import { provide, yeet, signal, useMemo, useOne } from '@use-gpu/live';

import { useBoundShader } from '../hooks/useBoundShader';
import { useLightContext } from '../providers/light-provider';
import { MaterialContext } from '../providers/material-provider';

import { getSolidSurface } from '@use-gpu/wgsl/instance/surface/solid.wgsl';
import { getSolidFragment } from '@use-gpu/wgsl/instance/fragment/solid.wgsl';

export type ShaderFlatMaterialProps = {
  /** Flat shader, for both lit and unlit passes (e.g. shadow map).
  
  fn getFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32>
   */
  fragment: ShaderModule,
  render?: (material: Record<string, Record<string, ShaderSource | null | undefined | void>>) => LiveElement,
};

export const ShaderFlatMaterial: LC<ShaderFlatMaterialProps> = (props: PropsWithChildren<ShaderFlatMaterialProps>) => {
  const {
    fragment,
    render,
    children,
  } = props;

  const getSurface = useBoundShader(getSolidSurface, [fragment]);
  const getLight = getSolidFragment;
  const getFragment = fragment;

  const context = useMemo(() => ({
    solid: {
      getFragment,
    },
    shaded: {
      getFragment,
      getSurface,
      getLight,
    },
  }), [getSurface, getLight]);

  const view = render ? render(context) : children;
  return render ?? children ? provide(MaterialContext, context, [signal(), view]) : yeet(context);
}
