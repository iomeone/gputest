import type { LiveComponent } from '@use-gpu/live';
import type { TypedArray, TextureSource, Atlas, Lazy } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { SDFGlyphData } from '../text/types';

import { gather, use, memo, useOne } from '@use-gpu/live';
import { useRawSource } from '../hooks/useRawSource';

import { TransformContextProps } from '../providers/transform-provider';
import { SDFFontProvider } from '../text/providers/sdf-font-provider';
import { GlyphSource } from '../text/glyph-source';
import { RawLabels, RawLabelsFlags } from '../primitives/raw-labels';

export type LabelLayerProps = RawLabelsFlags & {
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

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps,

  flip?: [number, number],
  sdfRadius?: number,

  detail?: number,
  count?: Lazy<number>,
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

    instance,
    instances,
    transform,

    flip,
    sdfRadius,

    detail,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars    
    count,
    mode = 'opaque',

    ...rest
  } = props;

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

            instance,
            instances,
            transform,

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

            ...rest,
          });
        },
    })
  );
}, 'LabelLayer');

