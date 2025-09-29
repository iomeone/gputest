import type { LiveComponent } from '@use-gpu/live';
import type { TypedArray, TextureSource, Atlas, Lazy, RenderPassMode } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { SDFGlyphData } from '../text/types';

import { gather, use, yeet, keyed, wrap, memo, debug, fragment, provide, useFiber, useOne, useState, useResource } from '@use-gpu/live';
import { bindBundle, bindingsToLinks } from '@use-gpu/shader/wgsl';
import { makeShaderBindings } from '@use-gpu/core';
import { useShaderRef } from '../hooks/useShaderRef';
import { useRawSource } from '../hooks/useRawSource';

import { useFontFamily } from '../text/providers/font-provider';
import { SDFFontProvider } from '../text/providers/sdf-font-provider';
import { DebugAtlas } from '../text/debug-atlas';
import { GlyphSource } from '../text/glyph-source';
import { PanControls } from '../camera/pan-controls';
import { RawLabels } from '../primitives/raw-labels';

export type LabelLayerProps = {
  position?: number[] | TypedArray,
  placement?: number[] | TypedArray,
  offset?: number,
  size?: number,
  depth?: number,
  color?: number[] | TypedArray,
  expand?: number,

  positions?: ShaderSource,
  placements?: ShaderSource,
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

  flip?: [number, number],
  sdfRadius?: number,
  detail?: number,
  count?: Lazy<number>,
  mode?: RenderPassMode | string,
  id?: number,
};

/** Draws flat text labels. */
export const LabelLayer: LiveComponent<LabelLayerProps> = memo((props: LabelLayerProps) => {
  const {
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

    label,
    labels,

    family,
    weight,
    style,

    flip,
    sdfRadius,
    detail,
    count,
    mode = 'opaque',
    id = 0,
  } = props;

  const key = useFiber().id;
  const strings = useOne(() => labels ?? (label != null ? [label] : []), labels ?? label);

  return (
    use(SDFFontProvider, {
      fence: gather,
      radius: sdfRadius,
      children:
        use(GlyphSource, {
          family,
          weight,
          style,
          strings,
          size: detail,
        }),
      then:
        (
          atlas: Atlas,
          source: TextureSource,
          [data] : [SDFGlyphData],
        ) => {
          const {sdf} = data;
          const indices = useRawSource(data.indices, 'u32');
          const rectangles = useRawSource(data.rectangles, 'vec4<f32>');
          const layouts = useRawSource(data.layouts, 'vec2<f32>');
          const uvs = useRawSource(data.uvs, 'vec4<f32>');

          return use(RawLabels, {
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

            flip,
            mode,
            id,
          });
        },
    })
  );
}, 'LabelLayer');

