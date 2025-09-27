import { LiveComponent } from '@use-gpu/live/types';
import { TypedArray, Prop, RenderPassMode } from '@use-gpu/core/types';
import { ShaderSource } from '@use-gpu/shader/types';
import { SDFGlyphData } from '../text/types';

import { use, keyed, wrap, memo, debug, provide, useCallback, useContext, useFiber, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { bindBundle, bindingsToLinks } from '@use-gpu/shader/wgsl';
import { makeShaderBindings } from '@use-gpu/core';
import { TransformContext, useTransformContext } from '../providers/transform-provider';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundStorage } from '../hooks/useBoundStorage';

import { useFontFamily } from '../text/providers/font-provider';
import { SDFFontProvider } from '../text/providers/sdf-font-provider';
import { DebugAtlas } from '../text/debug-atlas';
import { GlyphSource } from '../text/glyph-source';
import { RawLabels } from '../primitives/raw-labels';
import { UI, Flat } from '../layout';

import { getLabelPosition } from '@use-gpu/wgsl/instance/vertex/label.wgsl';

export type LabelLayerProps = {
  position?: number[] | TypedArray,
  placement?: number[] | TypedArray,
  //flip?: number,
  offset?: number,
  size?: number,
  depth?: number,
  color?: number[] | TypedArray,
  expand?: number,

  positions?: ShaderSource,
  placements?: ShaderSource,
  //flips?: ShaderSource,
  offsets?: ShaderSource,
  sizes?: ShaderSource,
  depths?: ShaderSource,
  colors?: ShaderSource,
  expands?: ShaderSource,

  label?: string,
  labels?: string[],

  family?: string,
  weight?: string | number,
  style?: string,

  detail?: number,
  count?: Prop<number>,
  mode?: RenderPassMode | string,
  id?: number,
};

export const LabelLayer: LiveComponent<LabelLayerProps> = memo((props: LabelLayerProps) => {
  const {
    position,
    positions,
    placement,
    placements,
    //flip,
    //flips,
    offset,
    offsets,
    size,
    sizes,
    depth,
    depths,
    color,
    colors,
    expand,
    expands,
    density,
    densities,

    label,
    labels,

    family,
    weight,
    style,

    sdfRadius,
    detail,
    count,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  const key = useFiber().id;

  return (
    use(SDFFontProvider, {
      radius: sdfRadius,
      children:
        use(GlyphSource, {
          family,
          weight,
          style,
          strings: labels ?? [label],
          size: detail,
        }),
      then:
        (
          atlas: Atlas,
          source: TextureSource,
          [data] : [SDFGlyphData],
        ) => {
          const {sdf} = data;
          const indices = useBoundStorage(data.indices, 'u32');
          const rectangles = useBoundStorage(data.rectangles, 'vec4<f32>');
          const layouts = useBoundStorage(data.layouts, 'vec2<f32>');
          const uvs = useBoundStorage(data.uvs, 'vec4<f32>');

          return ([
            //debug(wrap(Flat, wrap(UI, use(DebugAtlas, {atlas, source})))),
            use(RawLabels, {
              indices,
              rectangles,
              layouts,
              uvs,
              sdf,
              texture: source,
          
              position,
              positions,
              placement,
              placements,
              offset,
              offsets,
              size,
              sizes,
              depth,
              depths,
              color,
              colors,
              expand,
              expands,
              density,
              densities,

              count,
              mode,
              id,
            })
          ]);
        },
    })
  );
}, 'LabelLayer');

